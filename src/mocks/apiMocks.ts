// In-memory mocks for Events, Attendances and Reports
type ID = string;

const wait = (ms = 80) => new Promise((r) => setTimeout(r, ms));
const genId = (prefix = '') => `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export interface EventItem {
  id: ID;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  classId?: ID;
  createdAt: string;
  updatedAt?: string;
}

export interface Attendance {
  id: ID;
  eventId: ID;
  studentId: ID;
  studentName?: string;
  status: 'present' | 'absent' | 'late';
  recordedAt: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportFilter {
  from?: string;
  to?: string;
  classId?: ID;
  eventId?: ID;
  studentId?: ID;
  status?: Attendance['status'];
}

let eventsStore: EventItem[] = [];
let attendanceStore: Attendance[] = [];
let classesStore: any[] = [];

export const seedMocks = (opts?: { events?: EventItem[]; attendances?: Attendance[] }) => {
  eventsStore = opts?.events ? [...opts.events] : [
    {
      id: genId('ev-'),
      title: 'Aula inaugural',
      description: 'Primeira aula do semestre',
      startsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      classId: 'class-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: genId('ev-'),
      title: 'Reunião de pais',
      description: 'Encontro para conversas',
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      classId: 'class-2',
      createdAt: new Date().toISOString(),
    },
  ];

  attendanceStore = opts?.attendances ? [...opts.attendances] : [
    {
      id: genId('att-'),
      eventId: eventsStore[0].id,
      studentId: 'stu-1',
      studentName: 'Aluno 1',
      status: 'present',
      recordedAt: new Date().toISOString(),
    },
    {
      id: genId('att-'),
      eventId: eventsStore[0].id,
      studentId: 'stu-2',
      studentName: 'Aluno 2',
      status: 'absent',
      recordedAt: new Date().toISOString(),
    },
  ];

  // seed some classes with students and devices
  classesStore = [
    {
      id: 'class-1',
      name: 'Turma U BES - Manhã',
      code: 'UBES-M1',
      institutionId: 'inst-1',
      teacherId: 'teacher-1',
      students: [
        {
          id: 'stu-1',
          name: 'Aluno 1',
          email: 'aluno1@example.com',
          document: '123.456.789-00',
          device: {
            id: genId('dev-'),
            deviceId: 'AA:BB:CC:DD:EE:01',
            userId: 'stu-1',
            status: 'active',
            lastSeen: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: undefined,
          },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'stu-2',
          name: 'Aluno 2',
          email: 'aluno2@example.com',
          document: '987.654.321-00',
          device: undefined,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'class-2',
      name: 'Matemática - Vespertino',
      code: 'MAT-V',
      institutionId: 'inst-1',
      teacherId: 'teacher-1',
      students: [],
      createdAt: new Date().toISOString(),
    },
  ];
};

export const resetMocks = () => {
  eventsStore = [];
  attendanceStore = [];
};

seedMocks();

export const mockEventsApi = {
  list: async (query?: { classId?: ID; q?: string }) => {
    await wait();
    let res = [...eventsStore];
    if (query?.classId) res = res.filter((e) => e.classId === query.classId);
    if (query?.q) {
      const q = query.q.toLowerCase();
      res = res.filter((e) => (e.title || '').toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q));
    }
    return Promise.resolve(res);
  },
  get: async (id: ID) => {
    await wait();
    const ev = eventsStore.find((e) => e.id === id);
    if (!ev) return Promise.reject({ status: 404, message: 'Event not found' });
    return Promise.resolve(ev);
  },
  create: async (payload: Partial<EventItem>) => {
    await wait();
    const now = new Date().toISOString();
    const ev: EventItem = {
      id: genId('ev-'),
      title: payload.title || 'Untitled',
      description: payload.description,
      startsAt: payload.startsAt || now,
      endsAt: payload.endsAt,
      classId: payload.classId,
      createdAt: now,
      updatedAt: undefined,
    };
    eventsStore.push(ev);
    return Promise.resolve(ev);
  },
  update: async (id: ID, payload: Partial<EventItem>) => {
    await wait();
    const idx = eventsStore.findIndex((e) => e.id === id);
    if (idx === -1) return Promise.reject({ status: 404, message: 'Event not found' });
    eventsStore[idx] = { ...eventsStore[idx], ...payload, updatedAt: new Date().toISOString() };
    return Promise.resolve(eventsStore[idx]);
  },
  remove: async (id: ID) => {
    await wait();
    const idx = eventsStore.findIndex((e) => e.id === id);
    if (idx === -1) return Promise.reject({ status: 404, message: 'Event not found' });
    eventsStore.splice(idx, 1);
    attendanceStore = attendanceStore.filter((a) => a.eventId !== id);
    return Promise.resolve({ success: true });
  },
};

export const mockAttendanceApi = {
  list: async (query?: { eventId?: ID; studentId?: ID; status?: Attendance['status'] }) => {
    await wait();
    let res = [...attendanceStore];
    if (query?.eventId) res = res.filter((a) => a.eventId === query.eventId);
    if (query?.studentId) res = res.filter((a) => a.studentId === query.studentId);
    if (query?.status) res = res.filter((a) => a.status === query.status);
    return Promise.resolve(res);
  },
  get: async (id: ID) => {
    await wait();
    const a = attendanceStore.find((x) => x.id === id);
    if (!a) return Promise.reject({ status: 404, message: 'Attendance not found' });
    return Promise.resolve(a);
  },
  create: async (payload: { eventId: ID; studentId: ID; studentName?: string; status: Attendance['status']; notes?: string }) => {
    await wait();
    const att: Attendance = {
      id: genId('att-'),
      eventId: payload.eventId,
      studentId: payload.studentId,
      studentName: payload.studentName,
      status: payload.status,
      recordedAt: new Date().toISOString(),
      notes: payload.notes,
    };
    attendanceStore.push(att);
    return Promise.resolve(att);
  },
  update: async (id: ID, payload: Partial<Attendance>) => {
    await wait();
    const idx = attendanceStore.findIndex((x) => x.id === id);
    if (idx === -1) return Promise.reject({ status: 404, message: 'Attendance not found' });
    attendanceStore[idx] = { ...attendanceStore[idx], ...payload, updatedAt: new Date().toISOString() };
    return Promise.resolve(attendanceStore[idx]);
  },
  remove: async (id: ID) => {
    await wait();
    const idx = attendanceStore.findIndex((x) => x.id === id);
    if (idx === -1) return Promise.reject({ status: 404, message: 'Attendance not found' });
    attendanceStore.splice(idx, 1);
    return Promise.resolve({ success: true });
  },
};

export const mockClassesApi = {
  getMyClasses: async () => {
    await wait();
    return Promise.resolve([...classesStore]);
  },

  getClassById: async (id: ID) => {
    await wait();
    const cls = classesStore.find((c) => c.id === id);
    if (!cls) return Promise.reject({ status: 404, message: 'Class not found' });
    return Promise.resolve(cls);
  },

  resetStudentDevice: async (studentId: ID) => {
    await wait();
    for (const cls of classesStore) {
      const s = cls.students?.find((st: any) => st.id === studentId);
      if (s) {
        s.device = undefined;
        return Promise.resolve({ success: true });
      }
    }
    return Promise.reject({ status: 404, message: 'Student not found' });
  },
};

export const mockReportsApi = {
  attendanceReport: async (filter?: ReportFilter) => {
    await wait();
    let items = [...attendanceStore];

    if (filter?.from) items = items.filter((a) => new Date(a.recordedAt) >= new Date(filter.from!));
    if (filter?.to) items = items.filter((a) => new Date(a.recordedAt) <= new Date(filter.to!));
    if (filter?.classId) {
      const eventIds = eventsStore.filter((e) => e.classId === filter.classId).map((e) => e.id);
      items = items.filter((a) => eventIds.includes(a.eventId));
    }
    if (filter?.eventId) items = items.filter((a) => a.eventId === filter.eventId);
    if (filter?.studentId) items = items.filter((a) => a.studentId === filter.studentId);
    if (filter?.status) items = items.filter((a) => a.status === filter.status);

    const total = items.length;
    const byStatus = items.reduce<Record<string, number>>((acc, cur) => {
      acc[cur.status] = (acc[cur.status] || 0) + 1;
      return acc;
    }, {});

    return Promise.resolve({ total, byStatus, items });
  },

  eventsSummary: async (filter?: { from?: string; to?: string }) => {
    await wait();
    let evs = [...eventsStore];
    if (filter?.from) evs = evs.filter((e) => new Date(e.startsAt) >= new Date(filter.from!));
    if (filter?.to) evs = evs.filter((e) => new Date(e.startsAt) <= new Date(filter.to!));

    const summaries = evs.map((e) => {
      const atts = attendanceStore.filter((a) => a.eventId === e.id);
      return {
        event: e,
        totalAttendance: atts.length,
        present: atts.filter((a) => a.status === 'present').length,
        absent: atts.filter((a) => a.status === 'absent').length,
        late: atts.filter((a) => a.status === 'late').length,
      };
    });

    return Promise.resolve(summaries);
  },
};

export default {
  seedMocks,
  resetMocks,
  mockEventsApi,
  mockAttendanceApi,
  mockClassesApi,
  mockReportsApi,
};
