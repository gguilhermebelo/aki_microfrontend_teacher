import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, Calendar, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ReportsPage = () => {
  const [isLoading] = useState(false);

  const reportData = {
    eventTitle: 'Introduction to Algorithms',
    totalStudents: 45,
    presentCount: 40,
    absentCount: 3,
    lateCount: 2,
    attendanceRate: 88.9,
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
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            View attendance statistics and export data
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="1">CS101 - Algorithms</SelectItem>
                <SelectItem value="2">CS102 - Data Structures</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="event">
              <SelectTrigger>
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">By Event</SelectItem>
                <SelectItem value="class">By Class</SelectItem>
                <SelectItem value="student">By Student</SelectItem>
              </SelectContent>
            </Select>
            <Button className="gradient-primary">
              <Calendar className="mr-2 h-4 w-4" />
              Select Date Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reportData.totalStudents}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {reportData.presentCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent-foreground">
              {reportData.lateCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {reportData.absentCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>{reportData.eventTitle}</CardDescription>
            </div>
            <Button className="gradient-primary">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Attendance Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Attendance Rate</span>
                <span className="text-2xl font-bold text-primary">
                  {reportData.attendanceRate}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="gradient-primary h-3 rounded-full transition-all"
                  style={{ width: `${reportData.attendanceRate}%` }}
                />
              </div>
            </div>

            {/* Distribution */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Present</span>
                  <span className="text-sm font-medium">
                    {((reportData.presentCount / reportData.totalStudents) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(reportData.presentCount / reportData.totalStudents) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Late</span>
                  <span className="text-sm font-medium">
                    {((reportData.lateCount / reportData.totalStudents) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{
                      width: `${(reportData.lateCount / reportData.totalStudents) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Absent</span>
                  <span className="text-sm font-medium">
                    {((reportData.absentCount / reportData.totalStudents) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-destructive h-2 rounded-full"
                    style={{
                      width: `${(reportData.absentCount / reportData.totalStudents) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">CS101 Weekly Report</p>
                    <p className="text-xs text-muted-foreground">
                      Generated {i} day{i > 1 ? 's' : ''} ago
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-3 w-3" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
