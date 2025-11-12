const TOKEN_STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'aki_token';
const TEACHER_EMAIL_STORAGE_KEY = import.meta.env.VITE_AUTH_TEACHER_EMAIL_KEY || 'aki_teacher_email';
const TEACHER_ID_STORAGE_KEY = import.meta.env.VITE_AUTH_TEACHER_ID_KEY || 'aki_teacher_id';

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

  // Para o MVP sem autenticação real, considera sessão ativa se existir token OU email do professor
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const email = localStorage.getItem(TEACHER_EMAIL_STORAGE_KEY);
    return !!token || !!email; // fallback quando backend não envia token
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

  setTeacherId: (id: number | string) => {
    localStorage.setItem(TEACHER_ID_STORAGE_KEY, String(id));
  },

  getTeacherId: (): string | null => {
    return localStorage.getItem(TEACHER_ID_STORAGE_KEY);
  },

  removeTeacherId: () => {
    localStorage.removeItem(TEACHER_ID_STORAGE_KEY);
  },
};
