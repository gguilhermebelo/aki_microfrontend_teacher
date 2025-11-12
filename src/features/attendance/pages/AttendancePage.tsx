import { useEffect, useState } from 'react';
import { attendanceApi } from '../api/attendanceApi';
import { eventsApi } from '@/features/events/api/eventsApi';
import { classesApi } from '@/features/classes/api/classesApi';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface MinimalEventOption { id: string; label: string; classId: string; }

const AttendancePage = () => {
  const { latitude, longitude } = useGeolocation();
  const [classes, setClasses] = useState<any[]>([]);
  const [events, setEvents] = useState<MinimalEventOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendance, setAttendance] = useState<any[]>([]);
  const [eventQrToken, setEventQrToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [manualCpf, setManualCpf] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await classesApi.getMyClasses();
        setClasses(list);
        if (list.length) {
          setSelectedClassId(String(list[0].id));
          await loadEventsForClass(String(list[0].id));
        }
      } catch (e) {
        console.error('Falha ao carregar turmas', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadEventsForClass = async (classId: string) => {
    setLoading(true);
    try {
      const evs = await eventsApi.listByClass(classId);
      const mapped = evs.map(e => ({ id: e.id, label: e.startTime ? new Date(e.startTime).toLocaleString() : e.id, classId: e.classId }));
      setEvents(mapped);
      if (mapped.length) {
        setSelectedEventId(mapped[0].id);
        await loadAttendance(mapped[0].id);
      } else {
        setSelectedEventId('');
        setAttendance([]);
      }
    } catch (e) {
      console.error('Falha ao carregar eventos', e);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async (eventId: string) => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await attendanceApi.listByEvent(eventId);
      setAttendance(res.attendance);
      // BFF event shape should include qrToken
      const token = (res.event as any)?.qrToken || '';
      setEventQrToken(token);
    } catch (e) {
      console.error('Falha ao carregar presenças', e);
    } finally {
      setLoading(false);
    }
  };

  const registerManual = async () => {
    if (!selectedEventId) {
      window.alert('Selecione um evento');
      return;
    }
    if (!manualCpf) {
      window.alert('Informe o CPF do aluno');
      return;
    }
    // Ensure we have a qr token; if not, try fetching details via eventsApi
    let qrTokenToUse = eventQrToken;
    if (!qrTokenToUse) {
      try {
        const details = await eventsApi.details(selectedEventId);
        qrTokenToUse = details.event.qrCode || '';
        setEventQrToken(qrTokenToUse);
      } catch (e) {
        console.warn('Não foi possível obter qrToken do evento, abortando registro manual.');
      }
    }
    if (!qrTokenToUse) {
      window.alert('Evento sem QR Token disponível para registro.');
      return;
    }
    const deviceId = `manual_reg-${Date.now()}-${Math.floor(Math.random()*100000)}`;
    setRegistering(true);
    try {
      const rec = await attendanceApi.register({ student_cpf: manualCpf, qr_token: qrTokenToUse, device_id: deviceId, latitude: latitude ?? 0, longitude: longitude ?? 0 });
      setAttendance(prev => [rec, ...prev]);
      setManualCpf('');
    } catch (e: any) {
      window.alert(e.message || 'Falha ao registrar presença');
    } finally {
      setRegistering(false);
    }
  };

  if (loading && !attendance.length) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground mt-1">Visualize e registre presença manualmente.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Turma</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedClassId}
            onChange={async e => { const cid = e.target.value; setSelectedClassId(cid); await loadEventsForClass(cid); }}
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name || c.code}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Evento</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedEventId}
            onChange={async e => { const eid = e.target.value; setSelectedEventId(eid); await loadAttendance(eid); }}
          >
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.label}</option>)}
          </select>
        </div>
        <Button variant="outline" disabled={!selectedEventId} onClick={() => selectedEventId && loadAttendance(selectedEventId)}>Recarregar</Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Registro manual</CardTitle>
          <CardDescription>Use em casos onde o dispositivo não está cadastrado.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2 md:items-end">
            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium mb-1">CPF do aluno</label>
              <input
                className="border rounded px-2 py-1"
                placeholder="000.000.000-00"
                value={manualCpf}
                onChange={e => setManualCpf(e.target.value)}
              />
            </div>
            <Button onClick={registerManual} disabled={registering}>{registering ? 'Registrando...' : 'Registrar presença'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Presenças</CardTitle>
          <CardDescription>Lista de alunos registrados para o evento.</CardDescription>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma presença registrada ainda.</p>
          ) : (
            <div className="divide-y border rounded">
              {attendance.map(a => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{a.studentName || a.studentId}</span>
                    <span className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()} • {a.method}</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
