// Shared types for the application

export interface Teacher {
  id: string;
  name: string;
  email: string;
  document: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  code: string;
  institutionId: string;
  teacherId: string;
  students: Student[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  document: string;
  device?: Device;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  deviceId: string;
  userId: string;
  status: 'active' | 'inactive';
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  classId: string;
  className?: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'active' | 'closed' | 'canceled';
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  eventId: string;
  studentId: string;
  studentName?: string;
  status: 'present' | 'absent' | 'late';
  timestamp: string;
  method: 'automatic' | 'manual';
  correctedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceReport {
  eventId: string;
  eventTitle: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  attendances: Attendance[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
