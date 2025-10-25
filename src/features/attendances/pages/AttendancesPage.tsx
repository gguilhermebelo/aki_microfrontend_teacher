import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClipboardCheck, Search, Loader2 } from 'lucide-react';
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
  
  const attendances = [
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
  ];

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
        <Button className="gradient-primary">
          Manual Correction
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
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="1">Introduction to Algorithms</SelectItem>
                <SelectItem value="2">Data Structures Lab</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
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

      {/* Attendance List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Recent attendance entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendances.map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{attendance.studentName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {attendance.eventTitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(attendance.timestamp).toLocaleString()} • {attendance.method}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      attendance.status
                    )}`}
                  >
                    {attendance.status}
                  </span>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancesPage;
