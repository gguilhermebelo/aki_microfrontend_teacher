import { create } from 'zustand';
import { Teacher } from '@/shared/types';
import { authApi } from '../api/authApi';
import { authService } from '@/services/auth/authService';

interface AuthState {
  teacher: Teacher | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  teacher: null,
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      set({ teacher: response.teacher, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false,
        isAuthenticated: false 
      });
      throw error;
    }
  },

  logout: async () => {
    await authApi.logout();
    set({ teacher: null, isAuthenticated: false });
  },

  loadUser: async () => {
    if (!authService.isAuthenticated()) {
      set({ isAuthenticated: false, teacher: null });
      return;
    }
    
    set({ isLoading: true });
    try {
      const teacher = await authApi.getMe();
      set({ teacher, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isAuthenticated: false, teacher: null, isLoading: false });
      authService.removeToken();
    }
  },

  clearError: () => set({ error: null }),
}));
