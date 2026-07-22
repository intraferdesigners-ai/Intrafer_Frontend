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

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshClient = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: true,
      });
      const { data } = await refreshClient.post('/auth/refresh');
      const newToken = data.data?.accessToken;
      if (!newToken) throw new Error('No access token returned from refresh.');
      Cookies.set('intrafer_token', newToken, {
        expires: 1,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
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
    if (error.response?.status === 401 && !error.config._retried) {
      error.config._retried = true;
      try {
        const newToken = await refreshAccessToken();
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api(error.config);
      } catch {
        Cookies.remove('intrafer_token');
        Cookies.remove('intrafer_role');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

module.exports = api;
module.exports.default = api;
