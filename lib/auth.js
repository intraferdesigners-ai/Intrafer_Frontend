const _CookiesMod = require('js-cookie');
const Cookies = _CookiesMod.default || _CookiesMod;

// sameSite: 'lax', not 'strict' — these cookies are what middleware.js reads
// to decide whether a request is authenticated, and Strict cookies are
// withheld by the browser on the very first request after a top-level
// cross-site redirect back into the app (e.g. returning from a Razorpay
// netbanking/UPI bank page, or opening a link from an external app). That
// blanks out an otherwise-valid session and bounces the user to /auth/login
// with no way to tell it apart from actually being logged out. Lax still
// withholds the cookie on cross-site POSTs, which is what actually matters
// for CSRF here since real API calls authenticate via the Authorization
// header, not these cookies.
const COOKIE_OPTS = {
  expires: 1,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

function setAuthTokens(accessToken, role) {
  Cookies.set('intrafer_token', accessToken, COOKIE_OPTS);
  Cookies.set('intrafer_role', role, COOKIE_OPTS);
}

function clearAuthTokens() {
  Cookies.remove('intrafer_token');
  Cookies.remove('intrafer_role');
}

function getToken() {
  return Cookies.get('intrafer_token') || null;
}

function getRole() {
  return Cookies.get('intrafer_role') || null;
}

function isAuthenticated() {
  return !!Cookies.get('intrafer_token');
}

module.exports = { setAuthTokens, clearAuthTokens, getToken, getRole, isAuthenticated };
