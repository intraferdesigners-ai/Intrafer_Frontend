'use client';

import { create } from 'zustand';
import { setAuthTokens, clearAuthTokens, getToken, getRole } from '../lib/auth';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  role: null,
  isLoading: false,

  setAuth: (user, accessToken) => {
    setAuthTokens(accessToken, user.role);
    set({ user, token: accessToken, role: user.role });
  },

  clearAuth: () => {
    clearAuthTokens();
    set({ user: null, token: null, role: null });
  },

  setLoading: (bool) => set({ isLoading: bool }),

  initFromCookies: () => {
    const token = getToken();
    const role = getRole();
    if (!token) return;
    set({ token, role });

    // Only token/role survive a page refresh in cookies — the rest of `user`
    // (including isSuperAdmin/adminPermissions for admins) only ever lived in
    // memory, so re-hydrate it here whenever the store is initialised.
    api.get('/auth/me')
      .then(({ data }) => {
        const user = data.data?.user;
        if (user) set({ user, role: user.role });
      })
      .catch(() => {});
  },
}));

export default useAuthStore;
