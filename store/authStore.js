'use client';

import { create } from 'zustand';
import { setAuthTokens, clearAuthTokens, getToken, getRole } from '../lib/auth';

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
    if (token) {
      set({ token, role });
    }
  },
}));

export default useAuthStore;
