import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Loader2 } from 'lucide-react';
import { mockEventsApi } from '@/mocks/apiMocks';

const USE_MOCK = (import.meta as any).env?.VITE_USE_MOCK_API === 'true';

const initialEvents = [
  {
    id: '1',
    title: 'Introduction to Algorithms',
    className: 'CS101',
    startTime: '2025-10-26T09:00:00',
    endTime: '2025-10-26T10:30:00',
    location: 'Room 301',
    status: 'active' as const,
  },
  {
    id: '2',
    title: 'Data Structures Lab',
    className: 'CS102',
    startTime: '2025-10-26T14:00:00',
    endTime: '2025-10-26T16:00:00',
    location: 'Lab 2',
    status: 'active' as const,
  },
];

const EventsPage = () => {
  const [isLoading] = useState(false);
  const [events, setEvents] = useState(initialEvents);

  // create event state
  const [createMode, setCreateMode] = useState(false);
  const emptyCreate = { title: '', className: '', startTime: '', endTime: '', location: '' };
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [creating, setCreating] = useState(false);

  // editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    className: '',
    startTime: '',
    endTime: '',
    location: '',
  });

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

  const startEdit = (ev: any) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title || '',
      className: ev.className || '',
      startTime: ev.startTime || '',
      endTime: ev.endTime || '',
      location: ev.location || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...form } : e))
    );
    setEditingId(null);
  };

  const deleteEvent = async (id: string) => {
    const ok = window.confirm('Excluir este evento? Esta ação não pode ser desfeita.');
    if (!ok) return;
    // optimistic update
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (USE_MOCK) {
      try {
        await mockEventsApi.remove(id);
      } catch (err) {
        console.error('Failed to remove event (mock):', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">
            Manage attendance events and generate QR codes
          </p>
        </div>
        <Button className="gradient-primary" onClick={() => setCreateMode(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* create form (inline) */}
      {createMode && (
        <Card className="shadow-sm">
          <CardContent>
            <div className="max-w-3xl mx-auto">
              <div className="grid gap-4 md:grid-cols-2 items-center justify-center text-center">
                <input
                  className="w-full border rounded px-2 py-1"
                  placeholder="Title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((s) => ({ ...s, title: e.target.value }))}
                />

                <input
                  className="w-full border rounded px-2 py-1"
                  placeholder="Class name / classId"
                  value={createForm.className}
                  onChange={(e) => setCreateForm((s) => ({ ...s, className: e.target.value }))}
                />

                <div className="flex flex-col items-center">
                  <label className="text-sm font-medium mb-1">Início</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-2 py-1"
                    placeholder="Start"
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm((s) => ({ ...s, startTime: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <label className="text-sm font-medium mb-1">Fim</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-2 py-1"
                    placeholder="End"
                    value={createForm.endTime}
                    onChange={(e) => setCreateForm((s) => ({ ...s, endTime: e.target.value }))}
                  />
                </div>

                <input
                  className="w-full border rounded px-2 py-1 md:col-span-2 mx-auto"
                  placeholder="Location"
                  value={createForm.location}
                  onChange={(e) => setCreateForm((s) => ({ ...s, location: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 mt-4 justify-center">
                <Button variant="outline" onClick={() => { setCreateMode(false); setCreateForm(emptyCreate); }}>
                  Cancel
                </Button>
                <Button
                  className="gradient-primary"
                  onClick={async () => {
                    if (!createForm.title.trim()) {
                      window.alert('O campo título é obrigatório');
                      return;
                    }
                    setCreating(true);
                    try {
                      const payload: any = {
                        title: createForm.title,
                        description: undefined,
                        startsAt: createForm.startTime,
                        endsAt: createForm.endTime,
                        classId: createForm.className || undefined,
                      };
                      let res: any;
                      if (USE_MOCK) {
                        res = await mockEventsApi.create(payload);
                      } else {
                        res = { id: `ev-${Date.now()}`, ...payload, createdAt: new Date().toISOString() };
                      }

                      const newEvent = {
                        id: res.id,
                        title: res.title || createForm.title,
                        className: createForm.className,
                        startTime: res.startsAt || createForm.startTime,
                        endTime: res.endsAt || createForm.endTime,
                        location: createForm.location,
                        status: 'active' as const,
                      };

                      setEvents((prev) => [newEvent, ...prev]);
                      setCreateMode(false);
                      setCreateForm(emptyCreate);
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
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {event.className} • {event.location}
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
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={form.title}
                      onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                      placeholder="Title"
                    />
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={form.className}
                      onChange={(e) => setForm((s) => ({ ...s, className: e.target.value }))}
                      placeholder="Class"
                    />
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={form.location}
                      onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
                      placeholder="Location"
                    />
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        className="flex-1 border rounded px-2 py-1"
                        value={form.startTime}
                        onChange={(e) => setForm((s) => ({ ...s, startTime: e.target.value }))}
                      />
                      <input
                        type="datetime-local"
                        className="flex-1 border rounded px-2 py-1"
                        value={form.endTime}
                        onChange={(e) => setForm((s) => ({ ...s, endTime: e.target.value }))}
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
                          {new Date(event.startTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End:</span>
                        <span className="font-medium">
                          {new Date(event.endTime).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        View QR Code
                      </Button>
                      <Button variant="outline" onClick={() => deleteEvent(event.id)}>
                        Delete
                      </Button>
                      <Button className="flex-1 gradient-primary" onClick={() => startEdit(event)}>
                        Manage
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
  );
};

export default EventsPage;
