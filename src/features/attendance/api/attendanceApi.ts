import { getEventDetails, registerAttendance } from '@/services/bff/teacherBff';
import { Attendance } from '@/shared/types';

// Map BFF attendance record shape handled already in eventsApi (duplicated minimal logic to avoid circular import)
function mapAttendance(a: any): Attendance {
  return {
    id: `${a.studentId}-${a.recordedAt}`,
    eventId: '',
    studentId: String(a.studentId),
    studentName: a.studentName,
    status: a.status === 'manual' ? 'present' : a.status,
    timestamp: a.recordedAt,
    method: a.status === 'manual' ? 'manual' : 'automatic',
    createdAt: a.recordedAt,
    updatedAt: a.recordedAt,
  } as Attendance;
}

export const attendanceApi = {
  listByEvent: async (eventId: string) => {
    const details = await getEventDetails(eventId);
    return {
      event: details.event,
      attendance: details.attendance.map(mapAttendance),
    };
  },
  register: async (payload: { qr_token?: string; device_id?: string; student_cpf?: string; latitude?: number; longitude?: number }) => {
    const body: any = { ...payload };
    if (payload.latitude != null && payload.longitude != null) {
      body.location = { latitude: payload.latitude, longitude: payload.longitude };
      delete body.latitude;
      delete body.longitude;
    }
    body.device_time = new Date().toISOString();
    const record = await registerAttendance(body);
    return mapAttendance(record);
  },
};
