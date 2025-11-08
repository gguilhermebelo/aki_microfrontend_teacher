const TOKEN_STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'aki_token';
const TEACHER_EMAIL_STORAGE_KEY = import.meta.env.VITE_AUTH_TEACHER_EMAIL_KEY || 'aki_teacher_email';

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

  // teacher email helpers (used by BFF identification header)
  setTeacherEmail: (email: string) => {
    localStorage.setItem(TEACHER_EMAIL_STORAGE_KEY, email);
  },

  getTeacherEmail: (): string | null => {
    return localStorage.getItem(TEACHER_EMAIL_STORAGE_KEY);
  },

  removeTeacherEmail: () => {
    localStorage.removeItem(TEACHER_EMAIL_STORAGE_KEY);
  },
};
