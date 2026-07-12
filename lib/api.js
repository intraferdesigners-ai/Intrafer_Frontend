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

let _refreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retried) {
      if (!_refreshing) {
        _refreshing = true;
        try {
          const refreshClient = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL,
            withCredentials: true,
          });
          const { data } = await refreshClient.post('/auth/refresh');
          const newToken = data.data?.accessToken;
          if (newToken) {
            Cookies.set('intrafer_token', newToken, {
              expires: 1,
              sameSite: 'strict',
              secure: process.env.NODE_ENV === 'production',
            });
            error.config._retried = true;
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return api(error.config);
          }
        } catch {
          // refresh failed — fall through to logout
        } finally {
          _refreshing = false;
        }
      }

      Cookies.remove('intrafer_token');
      Cookies.remove('intrafer_role');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

module.exports = api;
module.exports.default = api;
