import { apiClient } from '@/services/http/axios';
import { Class } from '@/shared/types';
import { mockClassesApi } from '@/mocks/apiMocks';
import { authService } from '@/services/auth/authService';
import { getTeacherClasses, getClassDetails, removeStudentDevice } from '@/services/bff/teacherBff';

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

// Adapta o formato retornado pelo BFF para o formato interno existente
function mapRosterToClass(roster: any): Class {
  return {
    id: String(roster.id),
    name: roster.name || '',
    code: roster.code || '',
    institutionId: '',
    teacherId: roster.teachers?.[0] ? String(roster.teachers[0].id) : '',
    students: (roster.students || []).map((s: any) => ({
      id: String(s.id),
      name: s.fullName || '',
      email: '',
      document: s.cpf || '',
      device: s.deviceId
        ? {
            id: s.deviceId,
            deviceId: s.deviceId,
            userId: String(s.id),
            status: 'active',
            createdAt: '',
            updatedAt: '',
            lastSeen: undefined,
          }
        : undefined,
      createdAt: '',
      updatedAt: '',
    })),
    createdAt: '',
    updatedAt: '',
  };
}

const realImpl = {
  getMyClasses: async (): Promise<Class[]> => {
    const email = authService.getTeacherEmail();
    if (!email) return [];
    const rosters = await getTeacherClasses(email);
    return rosters.map(mapRosterToClass);
  },

  getClassById: async (classId: string): Promise<Class> => {
    const details = await getClassDetails(Number(classId));
    return mapRosterToClass(details.class);
  },

  resetStudentDevice: async (studentId: string): Promise<void> => {
    await removeStudentDevice(Number(studentId));
  },
};

export const classesApi = USE_MOCKS ? mockImpl : realImpl;
