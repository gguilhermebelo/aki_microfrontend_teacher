import { apiClient } from '@/services/http/axios';
import { Class, PaginatedResponse } from '@/shared/types';

export const classesApi = {
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
