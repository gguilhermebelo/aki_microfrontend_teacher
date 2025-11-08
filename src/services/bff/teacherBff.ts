import { apiClient } from '@/services/http/axios';

export interface Teacher {
  id: number;
  fullName: string;
  email: string;
}

export interface Student {
  id: number;
  fullName: string;
  cpf: string;
  deviceId?: string | null;
}

export interface ClassRoster {
  id: number;
  code?: string;
  name?: string;
  teachers?: Teacher[];
  students?: Student[];
}

export interface EventItem {
  id: number | string;
  classId: number;
  startAt?: string;
  endAt?: string;
  status?: 'scheduled' | 'active' | 'finished';
}

export interface AttendanceRecord {
  studentId: number;
  studentName: string;
  status: 'present' | 'absent' | 'manual';
  recordedAt: string;
}

const BASE = '';

export async function getTeacherClasses(teacherEmail: string): Promise<ClassRoster[]> {
  const res = await apiClient.get<ClassRoster[]>(`${BASE}/teachers/${encodeURIComponent(teacherEmail)}/classes`);
  return res.data;
}

export async function getClassDetails(classId: number): Promise<{ class: ClassRoster; recentEvents: EventItem[] }> {
  const res = await apiClient.get<{ class: ClassRoster; recentEvents: EventItem[] }>(`${BASE}/classes/${classId}`);
  return res.data;
}

export async function getClassEvents(classId: number): Promise<EventItem[]> {
  const res = await apiClient.get<EventItem[]>(`${BASE}/classes/${classId}/events`);
  return res.data;
}

export async function getEventDetails(eventId: string): Promise<{ event: EventItem; attendance: AttendanceRecord[] }> {
  const res = await apiClient.get<{ event: EventItem; attendance: AttendanceRecord[] }>(`${BASE}/events/${eventId}`);
  return res.data;
}

export async function registerAttendance(payload: {
  device_id?: string;
  qr_token?: string;
  location?: { latitude?: number; longitude?: number };
  device_time?: string;
  student_cpf?: string;
}): Promise<AttendanceRecord> {
  const res = await apiClient.post<AttendanceRecord>(`${BASE}/events/attendance`, payload);
  return res.data;
}

export async function removeStudentDevice(studentId: number): Promise<Student> {
  const res = await apiClient.delete<Student>(`${BASE}/students/${studentId}/device`);
  return res.data;
}

/**
 * Persistir um token QR associado a um evento (opcional - depende do BFF suportar este endpoint).
 * Endpoint proposto: POST /events/{eventId}/tokens
 * Payload: { token: string, meta?: Record<string, any> }
 */
export async function registerQrForEvent(
  eventId: number,
  token: string,
  meta?: Record<string, unknown>
): Promise<void> {
  await apiClient.post(`${BASE}/events/${eventId}/tokens`, { token, meta });
}
