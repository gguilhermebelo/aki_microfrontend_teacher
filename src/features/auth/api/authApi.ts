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
    try {
      const response = await apiClient.post<any>('/auth/login', credentials);

      // BFF may wrap teacher under response.data.data or response.data — accept both
      const payload = response?.data ?? response;
      const teacher: Teacher = payload?.data ?? payload;
      const message: string = payload?.message ?? 'Login successful';

      if (!teacher || !teacher.email) {
        throw new Error('Resposta inválida do servidor: teacher não encontrado');
      }

      // persistir email do teacher para cabeçalho X-Teacher-Email nas próximas requisições
      try {
        const { authService } = await import('@/services/auth/authService');
        authService.setTeacherEmail(teacher.email);
        // se o BFF eventualmente enviar token, salve também
        if (payload?.token) {
          authService.setToken(payload.token);
        }
      } catch (e) {
        // ignore localStorage errors
        // console.warn('Não foi possível salvar email do teacher localmente', e);
      }

      return { teacher, message };
    } catch (err: any) {
      // transform error for caller
      const serverMessage = err?.response?.data?.message || err?.message || 'Erro desconhecido ao efetuar login';
      throw new Error(serverMessage);
    }
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
