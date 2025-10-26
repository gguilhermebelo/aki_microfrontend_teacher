import { Teacher } from '@/shared/types';

export const fakeTeacher: Teacher = {
  id: 'mock-teacher-1',
  name: 'Mock Teacher',
  email: 'mock.teacher@example.com',
  document: '00000000000',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockLoginResponse = { teacher: fakeTeacher };

export const mockAuthApi = {
  login: async ({ email, password }: { email: string; password: string }) => {
    // Simula latência e retorno bem-sucedido
    await new Promise((r) => setTimeout(r, 100));
    return Promise.resolve(mockLoginResponse);
  },
  logout: async () => {
    await new Promise((r) => setTimeout(r, 50));
    return Promise.resolve();
  },
  getMe: async () => {
    await new Promise((r) => setTimeout(r, 50));
    return Promise.resolve(fakeTeacher);
  },
};

export const mockAuthService = {
  isAuthenticated: () => true,
  removeToken: () => {},
};

export default { fakeTeacher, mockLoginResponse, mockAuthApi, mockAuthService };
