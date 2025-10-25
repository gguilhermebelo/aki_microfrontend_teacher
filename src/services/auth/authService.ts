const TOKEN_STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'aki_token';

export const authService = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_STORAGE_KEY);
  },
};
