import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClipboardCheck, Search, Loader2 } from 'lucide-react';
import { mockAttendanceApi } from '@/mocks/apiMocks';

const USE_MOCK = (import.meta as any).env?.VITE_USE_MOCK_API === 'true';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AttendancesPage = () => {
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    studentName: '',
    eventTitle: '',
    status: 'present',
    timestamp: new Date().toISOString().slice(0, 16), // yyyy-mm-ddThh:mm
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const [attendances, setAttendances] = useState([
    {
      id: '1',
      studentName: 'John Doe',
      eventTitle: 'Introduction to Algorithms',
      status: 'present' as const,
      timestamp: '2025-10-25T09:05:00',
      method: 'automatic' as const,
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      eventTitle: 'Introduction to Algorithms',
      status: 'late' as const,
      timestamp: '2025-10-25T09:15:00',
      method: 'manual' as const,
    },
    {
      id: '3',
      studentName: 'Bob Johnson',
      eventTitle: 'Data Structures Lab',
      status: 'absent' as const,
      timestamp: '2025-10-25T14:00:00',
      method: 'automatic' as const,
    },
  ]);

  const deleteAttendance = async (id: string) => {
    const ok = window.confirm('Excluir esta chamada?');
    if (!ok) return;
    setAttendances((s) => s.filter((a) => a.id !== id));
    if (USE_MOCK) {
      try {
        await mockAttendanceApi.remove(id);
      } catch (err) {
        console.error('Failed to delete attendance (mock):', err);
      }
    }
  };

  const startEdit = (attendance: any) => {
    setManualForm({
      studentName: attendance.studentName || '',
      eventTitle: attendance.eventTitle || '',
      status: attendance.status || 'present',
      // convert ISO to yyyy-mm-ddThh:mm for input
      timestamp: attendance.timestamp ? new Date(attendance.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    });
    setEditingId(attendance.id);
    setShowManualForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowManualForm(false);
    setManualForm({ studentName: '', eventTitle: '', status: 'present', timestamp: new Date().toISOString().slice(0, 16) });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { studentName, eventTitle, status, timestamp } = manualForm;
    if (!studentName.trim() || !eventTitle.trim()) {
      window.alert('Preencha nome do aluno e título do evento.');
      return;
    }

    const updated = {
      id: editingId,
      studentName: studentName.trim(),
      eventTitle: eventTitle.trim(),
      status: status as 'present' | 'late' | 'absent',
      timestamp: new Date(timestamp).toISOString(),
      method: 'manual' as const,
    };

  setAttendances((s) => s.map((a) => (a.id === editingId ? ({ ...a, ...updated } as any) : a)));
    setEditingId(null);
    setShowManualForm(false);

    if (USE_MOCK) {
      try {
        await mockAttendanceApi.update(editingId, updated as any);
      } catch (err) {
        console.error('Failed to update attendance (mock):', err);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'late':
        return 'bg-accent/10 text-accent-foreground border-accent/20';
      case 'absent':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  // derived filtered list based on search and selects
  const q = searchQuery.trim().toLowerCase();
  const filteredAttendances = attendances.filter((a: any) => {
    const matchesQuery =
      !q || (a.studentName || '').toLowerCase().includes(q) || (a.eventTitle || '').toLowerCase().includes(q);
    const matchesEvent = selectedEvent === 'all' || (a.eventTitle || '') === selectedEvent;
    const matchesStatus = selectedStatus === 'all' || (a.status || '') === selectedStatus;
    return matchesQuery && matchesEvent && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold">Attendances</h1>
          <p className="text-muted-foreground mt-1">
            View and correct student attendance records
          </p>
        </div>
        <Button
          className="gradient-primary"
          onClick={() => {
            if (editingId) return cancelEdit();
            setShowManualForm((s) => !s);
          }}
        >
          {showManualForm ? (editingId ? 'Cancelar edição' : 'Cancelar') : 'Manual Correction'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedEvent} onValueChange={(v) => { console.log('selectedEvent ->', v); setSelectedEvent(v); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="Introduction to Algorithms">Introduction to Algorithms</SelectItem>
                <SelectItem value="Data Structures Lab">Data Structures Lab</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={(v) => { console.log('selectedStatus ->', v); setSelectedStatus(v); }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Manual insert form */}
      {showManualForm && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar presença' : 'Inserir presença manualmente'}</CardTitle>
            <CardDescription>Adicione uma presença manualmente para um aluno</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Input
                placeholder="Nome do aluno"
                value={manualForm.studentName}
                onChange={(e) => setManualForm((f) => ({ ...f, studentName: e.target.value }))}
                className=""
              />
              <Input
                placeholder="Título do evento"
                value={manualForm.eventTitle}
                onChange={(e) => setManualForm((f) => ({ ...f, eventTitle: e.target.value }))}
                className=""
              />
              <select
                className="input"
                value={manualForm.status}
                onChange={(e) => setManualForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
              </select>
              <Input
                type="datetime-local"
                value={manualForm.timestamp}
                onChange={(e) => setManualForm((f) => ({ ...f, timestamp: e.target.value }))}
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button onClick={() => {
                if (editingId) {
                  saveEdit();
                  return;
                }

                // validation + create
                const { studentName, eventTitle, status, timestamp } = manualForm;
                if (!studentName.trim() || !eventTitle.trim()) {
                  window.alert('Preencha nome do aluno e título do evento.');
                  return;
                }
                const newAttendance = {
                  id: String(Date.now()),
                  studentName: manualForm.studentName.trim(),
                  eventTitle: manualForm.eventTitle.trim(),
                  status: manualForm.status,
                  timestamp: new Date(manualForm.timestamp).toISOString(),
                  method: 'manual',
                } as any;

                setAttendances((s) => [newAttendance, ...s]);
                setShowManualForm(false);

                if (USE_MOCK) {
                  // mock API expects eventId and studentId, provide synthetic ids for manual entries
                  mockAttendanceApi
                    .create({ eventId: `manual-${Date.now()}`, studentId: `manual-${Date.now()}`, studentName: newAttendance.studentName, status: newAttendance.status })
                    .catch((err) => console.error('Failed to create attendance (mock):', err));
                }
              }}>
                {editingId ? 'Salvar alterações' : 'Inserir presença'}
              </Button>
              <Button variant="ghost" onClick={() => cancelEdit()}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Recent attendance entries</CardDescription>
        </CardHeader>
        <CardContent>
          {/* derive filtered list from filters */}
          {filteredAttendances.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance records match the filters.</p>
          ) : (
            <div className="space-y-4">
              {filteredAttendances.map((attendance) => (
                <div
                  key={attendance.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{attendance.studentName}</h4>
                    <p className="text-sm text-muted-foreground">{attendance.eventTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(attendance.timestamp).toLocaleString()} • {attendance.method}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      attendance.status
                    )}`}>{attendance.status}</span>
                    <Button variant="outline" size="sm" onClick={() => startEdit(attendance)}>Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => deleteAttendance(attendance.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancesPage;
