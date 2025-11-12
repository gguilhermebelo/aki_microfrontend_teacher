import { create } from 'zustand';
import { Teacher } from '@/shared/types';
import { authApi } from '../api/authApi';
import { authService } from '@/services/auth/authService';

const api = authApi;
const service = authService;

interface AuthState {
  teacher: Teacher | null;
  isAuthenticated: boolean;
  isLoading: boolean; // loading user/login
  initialized: boolean; // já tentou restaurar sessão
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  teacher: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.login({ email, password });
      // garante persistência do email para manter sessão pós-refresh
      authService.setTeacherEmail(response.teacher.email);
      authService.setTeacherId(response.teacher.id);
      set({ teacher: response.teacher, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Login failed',
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    await api.logout();
    authService.removeTeacherEmail();
    set({ teacher: null, isAuthenticated: false });
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      // se já temos teacher carregado, não refazer
      const email = authService.getTeacherEmail();
      if (!email) {
        // tentativa de obter /teachers/me (quando backend suportar)
        try {
          const teacher = await api.getMe();
          authService.setTeacherEmail(teacher.email);
          set({ teacher, isAuthenticated: true, isLoading: false, initialized: true });
          return;
        } catch {
          set({ isAuthenticated: false, teacher: null, isLoading: false, initialized: true });
          return;
        }
      }
      // Temos email persistido - montar objeto mínimo caso getMe falhe
      try {
        const teacher = await api.getMe();
        authService.setTeacherEmail(teacher.email);
        authService.setTeacherId(teacher.id);
        set({ teacher, isAuthenticated: true, isLoading: false, initialized: true });
      } catch {
        // fallback minimal teacher para manter sessão (MVP)
        set({
          teacher: email ? { id: 'temp', name: email.split('@')[0], email, document: '', createdAt: '', updatedAt: '' } as any : null,
          isAuthenticated: !!email,
          isLoading: false,
          initialized: true,
        });
      }
    } catch {
      set({ isAuthenticated: false, teacher: null, isLoading: false, initialized: true });
    }
  },

  clearError: () => set({ error: null }),
}));
