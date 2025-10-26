import { apiClient } from '@/services/http/axios';
import { Class, PaginatedResponse } from '@/shared/types';
import { mockClassesApi } from '@/mocks/apiMocks';

// Toggle mocks by setting VITE_USE_MOCK_API=true in your .env (Vite)
const USE_MOCKS = (import.meta as any).env?.VITE_USE_MOCK_API === 'true';

const mockImpl = {
  getMyClasses: async (): Promise<Class[]> => {
    return mockClassesApi.getMyClasses();
  },
  getClassById: async (classId: string): Promise<Class> => {
    return mockClassesApi.getClassById(classId);
  },
  resetStudentDevice: async (studentId: string): Promise<void> => {
    await mockClassesApi.resetStudentDevice(studentId);
    return;
  },
};

const realImpl = {
  getMyClasses: async (): Promise<Class[]> => {
    const response = await apiClient.get<PaginatedResponse<Class>>('/teachers/me/classes');
    return response.data.data;
  },

  getClassById: async (classId: string): Promise<Class> => {
    const response = await apiClient.get<{ data: Class }>(`/classes/${classId}`);
    return response.data.data;
  },

  resetStudentDevice: async (studentId: string): Promise<void> => {
    await apiClient.post(`/students/${studentId}/reset-device`);
  },
};

export const classesApi = USE_MOCKS ? mockImpl : realImpl;
