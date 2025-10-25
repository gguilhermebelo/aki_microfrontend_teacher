import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Users, Calendar, ClipboardCheck, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const { teacher } = useAuth();
  const [stats] = useState({
    totalClasses: 5,
    activeEvents: 2,
    todayAttendances: 38,
    averageAttendance: 92,
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="gradient-hero rounded-lg p-8 shadow-primary">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {teacher?.name}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's what's happening with your classes today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-primary transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active this semester
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-primary transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Happening today
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-primary transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendances</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayAttendances}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Students checked in
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-primary transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageAttendance}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardDescription>
              Manage your classes and students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/classes">
              <Button className="w-full gradient-primary">
                View All Classes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>
              Create and manage attendance events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/events">
              <Button className="w-full gradient-primary">
                Manage Events
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              View attendance reports and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/reports">
              <Button className="w-full gradient-primary">
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="font-medium">Event created: Algorithm Class</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="font-medium">Attendance corrected: 3 students</p>
                <p className="text-sm text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="font-medium">Report exported: CS101 Weekly Report</p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
