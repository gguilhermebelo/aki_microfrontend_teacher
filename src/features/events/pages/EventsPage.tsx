import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Loader2, Trash2, Pencil, ListChecks } from 'lucide-react';
import { eventsApi } from '../api/eventsApi';
import { classesApi } from '@/features/classes/api/classesApi';
import { useGeolocation } from '@/hooks/use-geolocation';

const USE_MOCK = (import.meta as any).env?.VITE_USE_MOCK_API === 'true';

// eventos são carregados dinamicamente via BFF
const initialEvents: any[] = [];

const EventsPage = () => {
  const { latitude, longitude, error: geoError, loading: geoLoading, refresh: refreshGeo } = useGeolocation();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // create event state
  const [createMode, setCreateMode] = useState(false);
  const emptyCreate = { classId: '', startAt: '', endAt: '' };
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [creating, setCreating] = useState(false);

  // editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    classId: '',
    startAt: '',
    endAt: '',
    location: '',
  });

  // edit dialog state (using inline form already)
  const allowedStatuses = ['scheduled', 'active', 'finished', 'closed', 'canceled'] as const;

  useEffect(() => {
    // carrega turmas para selecionar classe
    (async () => {
      setIsLoading(true);
      try {
        const list = await classesApi.getMyClasses();
        setClasses(list);
        if (list.length) {
          setSelectedClassId(String(list[0].id));
          await loadEvents(String(list[0].id));
        }
      } catch (e) {
        console.error('Falha ao carregar turmas', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loadEvents = async (classId: string) => {
    setIsLoading(true);
    try {
      const data = await eventsApi.listByClass(classId);
      setEvents(data);
    } catch (e) {
      console.error('Falha ao carregar eventos', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'closed':
        return 'bg-muted text-muted-foreground border-border';
      case 'canceled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const toLocalInput = (iso: string) => {
    // Converte ISO para formato aceito por <input type="datetime-local">
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    // yyyy-MM-ddTHH:mm
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const startEdit = (ev: any) => {
    setEditingId(ev.id);
    setForm({
      title: '',
      classId: ev.classId || selectedClassId,
      startAt: toLocalInput(ev.startTime),
      endAt: toLocalInput(ev.endTime),
      location: ev.status || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      const updated = await eventsApi.update(id, {
        startAt: form.startAt,
        endAt: form.endAt,
        status: form.location as any, // repurpose location field for status before removal; will adjust below
      });
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setEditingId(null);
    } catch (e: any) {
      window.alert(e.message || 'Falha ao atualizar evento');
    }
  };

  const deleteEvent = async (id: string) => {
    const ok = window.confirm('Excluir este evento? Esta ação não pode ser desfeita.');
    if (!ok) return;
    try {
      await eventsApi.remove(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (e: any) {
      window.alert(e.message || 'Falha ao excluir evento');
    }
  };

  // Remove QR code related functions & state

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">
            Manage attendance events and generate QR codes
          </p>
        </div>
        <Button className="gradient-primary" onClick={() => setCreateMode(true)} disabled={!selectedClassId}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="flex gap-2 items-center mb-2">
        <label className="text-sm font-medium">Classe:</label>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={selectedClassId}
          onChange={async (e) => {
            const cid = e.target.value;
            setSelectedClassId(cid);
            await loadEvents(cid);
          }}
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name || c.code}</option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={() => selectedClassId && loadEvents(selectedClassId)} disabled={!selectedClassId || isLoading}>Recarregar</Button>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          {geoLoading && <span>Localizando...</span>}
          {!geoLoading && latitude != null && longitude != null && (
            <span>Lat: {latitude.toFixed(4)} Lng: {longitude.toFixed(4)}</span>
          )}
          {!geoLoading && geoError && (
            <button className="underline" onClick={refreshGeo}>Permitir localização</button>
          )}
        </div>
      </div>

      {/* create form (inline) */}
      {createMode && (
        <Card className="shadow-sm">
          <CardContent>
            <div className="max-w-3xl mx-auto">
              <div className="grid gap-4 md:grid-cols-2 items-center justify-center text-center">
                {/* Campo de título removido */}

                <select
                  className="w-full border rounded px-2 py-1"
                  value={createForm.classId || selectedClassId}
                  onChange={(e) => setCreateForm((s) => ({ ...s, classId: e.target.value }))}
                >
                  <option value="">Selecione a turma</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.code}</option>
                  ))}
                </select>

                <div className="flex flex-col items-center">
                  <label className="text-sm font-medium mb-1">Início</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-2 py-1"
                    placeholder="Início"
                    value={createForm.startAt}
                    onChange={(e) => setCreateForm((s) => ({ ...s, startAt: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <label className="text-sm font-medium mb-1">Fim</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-2 py-1"
                    placeholder="Fim"
                    value={createForm.endAt}
                    onChange={(e) => setCreateForm((s) => ({ ...s, endAt: e.target.value }))}
                  />
                </div>

                {/* Campo de location removido (usamos geolocalização ou 0,0) */}
              </div>

              <div className="flex gap-2 mt-4 justify-center">
                <Button variant="outline" onClick={() => { setCreateMode(false); setCreateForm(emptyCreate); }}>
                  Cancel
                </Button>
                <Button
                  className="gradient-primary"
                  onClick={async () => {
                    if (!createForm.classId) {
                      window.alert('Selecione a turma');
                      return;
                    }
                    setCreating(true);
                    try {
                      try {
                        const created = await eventsApi.create({
                          classId: createForm.classId,
                          startAt: createForm.startAt,
                          endAt: createForm.endAt,
                          latitude: latitude ?? 0,
                          longitude: longitude ?? 0,
                        });
                        setEvents((prev) => [created, ...prev]);
                        setCreateMode(false);
                        setCreateForm(emptyCreate);
                      } catch (e: any) {
                        window.alert(e.message || 'Falha na validação das datas');
                      }
                    } catch (err) {
                      console.error('Failed to create event:', err);
                      window.alert('Falha ao criar evento');
                    } finally {
                      setCreating(false);
                    }
                  }}
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {events.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No events found</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first attendance event
            </p>
            <Button className="gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="shadow-sm hover:shadow-primary transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">Evento de Aula</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedClassId} • {event.location || '—'}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingId === event.id ? (
                  // inline edit form
                  <div className="space-y-3">
                    {/* Campo de edição de título removido */}
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={form.location}
                      onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
                    >
                      <option value="">Status</option>
                      {allowedStatuses.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={form.startAt}
                      onChange={(e) => setForm((s) => ({ ...s, startAt: e.target.value }))}
                      placeholder="Início"
                    />
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        className="flex-1 border rounded px-2 py-1"
                        value={form.startAt}
                        onChange={(e) => setForm((s) => ({ ...s, startAt: e.target.value }))}
                      />
                      <input
                        type="datetime-local"
                        className="flex-1 border rounded px-2 py-1"
                        value={form.endAt}
                        onChange={(e) => setForm((s) => ({ ...s, endAt: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                      <Button className="gradient-primary" onClick={() => saveEdit(event.id)}>Save</Button>
                    </div>
                  </div>
                ) : (
                  // read-only view
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start:</span>
                        <span className="font-medium">
                          {event.startTime ? new Date(event.startTime).toLocaleString() : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End:</span>
                        <span className="font-medium">
                          {event.endTime ? new Date(event.endTime).toLocaleString() : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => deleteEvent(String(event.id))}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                      <Button variant="outline" onClick={() => startEdit(event)} className="flex-1">
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" onClick={() => window.location.href = `/attendance?event=${event.id}&class=${selectedClassId}`}> 
                        <ListChecks className="h-4 w-4 mr-1" /> Attendance
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
  </div>
  {/* QR Code modal removido */}
    </>
  );
};

export default EventsPage;
