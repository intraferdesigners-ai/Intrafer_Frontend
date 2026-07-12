const _CookiesMod = require('js-cookie');
const Cookies = _CookiesMod.default || _CookiesMod;

const COOKIE_OPTS = {
  expires: 1,
  sameSite: 'strict',
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
