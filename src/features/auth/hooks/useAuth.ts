import { create } from 'zustand';
import { Teacher } from '@/shared/types';
import { authApi } from '../api/authApi';
import { authService } from '@/services/auth/authService';
import { mockAuthApi, mockAuthService } from '@/mocks/authMocks';

// Toggle mocks by setting VITE_USE_MOCK_AUTH=true in your .env (Vite)
const USE_MOCKS = (import.meta as any).env?.VITE_USE_MOCK_AUTH === 'true';

const api = USE_MOCKS ? mockAuthApi : authApi;
const service = USE_MOCKS ? mockAuthService : authService;

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
  isAuthenticated: service.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.login({ email, password });
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
  await api.logout();
    set({ teacher: null, isAuthenticated: false });
  },

  loadUser: async () => {
    if (!service.isAuthenticated()) {
      set({ isAuthenticated: false, teacher: null });
      return;
    }
    
    set({ isLoading: true });
    try {
      const teacher = await api.getMe();
      set({ teacher, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isAuthenticated: false, teacher: null, isLoading: false });
      service.removeToken();
    }
  },

  clearError: () => set({ error: null }),
}));
