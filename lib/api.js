const axios = require('axios');
const _CookiesMod = require('js-cookie');
const Cookies = _CookiesMod.default || _CookiesMod;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('intrafer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Shared across all concurrent 401s: the first one starts the refresh and
// stores the in-flight promise here; any 401 arriving while a refresh is
// already in flight awaits this SAME promise instead of independently
// deciding the session is dead and forcing a logout out from under a
// refresh that's about to succeed.
let refreshPromise = null;

// A 401 from these endpoints is an expected authentication-attempt failure
// (wrong password, expired OTP, dead refresh token, ...), not a sign that an
// existing session died mid-use — it must reach the caller's own .catch()
// as-is instead of triggering the refresh-then-hard-redirect flow below,
// which would otherwise wipe the login form's state (and its error message)
// out from under the user before they ever see it.
const AUTH_FLOW_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/send-otp', '/auth/verify-otp', '/auth/refresh'];

function isAuthFlowRequest(config) {
  const url = config?.url || '';
  return AUTH_FLOW_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshClient = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: true,
      });
      const { data } = await refreshClient.post('/auth/refresh');
      const newToken = data.data?.accessToken;
      const role = data.data?.role;
      if (!newToken) throw new Error('No access token returned from refresh.');
      // Kept in lockstep with lib/auth.js's COOKIE_OPTS (see the comment
      // there) — 'lax', not 'strict', so a silent refresh triggered right
      // after a top-level cross-site redirect back into the app (e.g. a
      // Razorpay bank-page return) still lands with a readable session
      // instead of these cookies being withheld on that first request.
      const cookieOpts = {
        expires: 1,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      };
      Cookies.set('intrafer_token', newToken, cookieOpts);
      // intrafer_role is only ever written at login otherwise — re-setting it
      // here on every silent refresh keeps its 1-day expiry in lockstep with
      // intrafer_token's, so a long session's role cookie can never go stale
      // or expire out from under a still-valid access token. Without this,
      // middleware.js (cookie-only) and the client (which can re-derive role
      // from /auth/me via the access token alone) drift apart: the UI still
      // looks logged in while every protected-route navigation gets bounced.
      if (role) Cookies.set('intrafer_role', role, cookieOpts);
      return newToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 429 (rate limited) is deliberately NOT handled here — this branch is
    // keyed on === 401 specifically, not >= 400 or "not ok", so a rate limit
    // can never be misread as a dead session and force a logout. It falls
    // through to the plain `Promise.reject(error)` below, reaching the
    // caller's own .catch() with the backend's rate-limit message
    // (rateLimiter.js) intact for the caller to surface as-is.
    if (error.response?.status === 401 && !error.config._retried && !isAuthFlowRequest(error.config)) {
      error.config._retried = true;
      // Refresh succeeding and the retried request failing are two different
      // outcomes — only a failed refresh means the session is actually dead.
      // A single try/catch around both used to treat any failure of the
      // retried request itself (a 403, 404, transient 500, ...) as a failed
      // refresh, wiping valid auth cookies and hard-redirecting to login even
      // though the token had just been renewed successfully.
      let newToken;
      try {
        newToken = await refreshAccessToken();
      } catch {
        Cookies.remove('intrafer_token');
        Cookies.remove('intrafer_role');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return api(error.config);
    }
    return Promise.reject(error);
  }
);

module.exports = api;
module.exports.default = api;
