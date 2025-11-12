import { getClassEvents, getEventDetails, createEvent, registerAttendance, updateEvent, deleteEvent, EventItem, AttendanceRecord } from '@/services/bff/teacherBff';
import { authService } from '@/services/auth/authService';
import { Event, Attendance } from '@/shared/types';

// Map BFF EventItem to internal Event type
function mapEvent(e: EventItem): Event {
  return {
    id: String(e.id),
    title: '', // BFF não envia title (qr events) - manter vazio ou derivar
    classId: String(e.classId),
    className: undefined,
    startTime: e.startAt || '',
    endTime: e.endAt || '',
    location: e.status || '', // placeholder; BFF location fica separado
    status: (e.status === 'finished' ? 'closed' : e.status === 'scheduled' ? 'active' : e.status) as any,
    qrCode: e.qrToken,
    createdAt: '',
    updatedAt: '',
  };
}

function mapAttendance(a: AttendanceRecord): Attendance {
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
  };
}

function normalizeToIsoLocal(value: string): string {
  // Aceita formatos de input de <input type="datetime-local"> (YYYY-MM-DDTHH:MM)
  // Converte para ISO completo (YYYY-MM-DDTHH:MM:SS.sssZ) assumindo timezone local.
  if (!value) return '';
  // Se já tiver segundos / 'Z', retorna como está
  if (/Z$/.test(value) || /:\d{2}/.test(value)) {
    // tentar new Date parse; se inválido retorna original
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toISOString();
  }
  // value formato 'YYYY-MM-DDTHH:MM'
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    // adicionar ':00' e tentar novamente
    const withSeconds = value + ':00';
    const d2 = new Date(withSeconds);
    return isNaN(d2.getTime()) ? value : d2.toISOString();
  }
  return date.toISOString();
}

export const eventsApi = {
  listByClass: async (classId: string): Promise<Event[]> => {
    const events = await getClassEvents(Number(classId));
    return events.map(mapEvent);
  },
  details: async (eventId: string): Promise<{ event: Event; attendance: Attendance[] }> => {
    const res = await getEventDetails(eventId);
    return { event: mapEvent(res.event), attendance: res.attendance.map(mapAttendance) };
  },
  create: async (payload: { classId: string; startAt: string; endAt: string; latitude?: number; longitude?: number }): Promise<Event> => {
    // Normaliza datas para ISO completo
    const startIso = normalizeToIsoLocal(payload.startAt);
    const endIso = normalizeToIsoLocal(payload.endAt);
    if (!startIso || !endIso) {
      throw new Error('Datas inválidas: startAt ou endAt ausentes');
    }
    if (new Date(startIso) >= new Date(endIso)) {
      throw new Error('Data/hora inicial deve ser anterior à final');
    }
    const teacherIdStr = authService.getTeacherId();
    const teacherId = teacherIdStr ? Number(teacherIdStr) : 0;
    const created = await createEvent({
      classId: Number(payload.classId),
      teacherId,
      startAt: startIso,
      endAt: endIso,
      location: { latitude: payload.latitude ?? 0, longitude: payload.longitude ?? 0 },
    });
    return mapEvent(created);
  },
  update: async (eventId: string, payload: { startAt?: string; endAt?: string; status?: 'scheduled' | 'active' | 'finished' | 'closed' | 'canceled' }): Promise<Event> => {
    // Normaliza apenas campos enviados
  const body: { startAt?: string; endAt?: string; status?: 'scheduled' | 'active' | 'finished' | 'closed' | 'canceled' } = {};
    if (payload.startAt) {
      body.startAt = normalizeToIsoLocal(payload.startAt);
    }
    if (payload.endAt) {
      body.endAt = normalizeToIsoLocal(payload.endAt);
    }
    if (body.startAt && body.endAt) {
      if (new Date(body.startAt) >= new Date(body.endAt)) {
        throw new Error('Data/hora inicial deve ser anterior à final');
      }
    }
    if (payload.status) {
      body.status = payload.status;
    }
    const updated = await updateEvent(eventId, body);
    return mapEvent(updated);
  },
  remove: async (eventId: string): Promise<void> => {
    await deleteEvent(eventId);
  },
  registerAttendance: async (payload: { device_id?: string; qr_token?: string; student_cpf?: string }): Promise<Attendance> => {
    const record = await registerAttendance({ ...payload });
    return mapAttendance(record);
  },
};
