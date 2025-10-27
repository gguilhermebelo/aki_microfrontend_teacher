import { apiClient } from '@/services/http/axios';
import { authService } from '@/services/auth/authService';
import { Teacher } from '@/shared/types';

interface LoginRequest {
  email: string;
  password: string;
}


interface RecoverPasswordRequest {
  teacher_email: string;
}

interface RecoverPasswordResponse {
  status: string;
  teacher_email: string;
  sent_at: string;
}


interface LoginResponse {
  data: Teacher;
  message: string;
}


export const authApi = {
  login: async (credentials: LoginRequest): Promise<{ teacher: Teacher; message: string }> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    // No token in BFF response, just teacher data and message
    return { teacher: response.data.data, message: response.data.message };
  },

  recoverPassword: async (payload: RecoverPasswordRequest): Promise<RecoverPasswordResponse> => {
    const response = await apiClient.post<RecoverPasswordResponse>('/auth/recover-password', payload);
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
