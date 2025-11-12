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
      const payload = response?.data ?? response;
      const raw = payload?.data ?? payload;

      if (!raw || !raw.email) {
        throw new Error('Resposta inválida do servidor: teacher não encontrado');
      }

      // Normaliza campos (full_name -> name)
      const teacher: Teacher = {
        id: String(raw.id),
        name: raw.full_name || raw.fullName || raw.name || '',
        email: raw.email,
        document: raw.document || '',
        createdAt: raw.created_at || '',
        updatedAt: raw.updated_at || '',
      };
      const message: string = payload?.message ?? 'Login successful';

      // Persistir email e id para uso em headers e criação de eventos
      authService.setTeacherEmail(teacher.email);
      if (raw.id !== undefined) authService.setTeacherId(raw.id);
      if (payload?.token) authService.setToken(payload.token);

      return { teacher, message };
    } catch (err: any) {
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
    const response = await apiClient.get<{ data: any }>('/teachers/me');
    const raw = response.data.data;
    const teacher: Teacher = {
      id: String(raw.id),
      name: raw.full_name || raw.fullName || raw.name || '',
      email: raw.email,
      document: raw.document || '',
      createdAt: raw.created_at || '',
      updatedAt: raw.updated_at || '',
    };
    // garantir persistência em restauração
    authService.setTeacherEmail(teacher.email);
    if (raw.id !== undefined) authService.setTeacherId(raw.id);
    return teacher;
  },
};
