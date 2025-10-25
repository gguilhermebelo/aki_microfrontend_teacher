import { apiClient } from '@/services/http/axios';
import { authService } from '@/services/auth/authService';
import { Teacher } from '@/shared/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  teacher: Teacher;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    authService.setToken(response.data.token);
    return response.data;
  },

  logout: async (): Promise<void> => {
    authService.removeToken();
  },

  getMe: async (): Promise<Teacher> => {
    const response = await apiClient.get<{ data: Teacher }>('/teachers/me');
    return response.data.data;
  },
};
