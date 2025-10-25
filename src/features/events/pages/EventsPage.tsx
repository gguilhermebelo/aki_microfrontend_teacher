import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Loader2 } from 'lucide-react';

const EventsPage = () => {
  const [isLoading] = useState(false);
  const [events] = useState([
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
  ]);

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
        <Button className="gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

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
                  <Button className="flex-1 gradient-primary">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
