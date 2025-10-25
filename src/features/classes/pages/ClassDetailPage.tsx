import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { classesApi } from '../api/classesApi';
import { Class } from '@/shared/types';
import { ArrowLeft, Users, Smartphone, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resetStudentId, setResetStudentId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (classId) {
      loadClassDetails();
    }
  }, [classId]);

  const loadClassDetails = async () => {
    if (!classId) return;
    
    setIsLoading(true);
    try {
      const data = await classesApi.getClassById(classId);
      setClassData(data);
    } catch (error) {
      toast.error('Failed to load class details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDevice = async () => {
    if (!resetStudentId) return;

    setIsResetting(true);
    try {
      await classesApi.resetStudentDevice(resetStudentId);
      toast.success('Device reset successfully');
      setResetStudentId(null);
      loadClassDetails();
    } catch (error) {
      toast.error('Failed to reset device');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/classes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Classes
        </Button>
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Class not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/classes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Class Info */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{classData.name}</CardTitle>
              <CardDescription className="mt-1">
                Class Code: {classData.code}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span className="font-medium">
                {classData.students?.length || 0} students
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Students Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Manage student enrollments and devices</CardDescription>
        </CardHeader>
        <CardContent>
          {!classData.students || classData.students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No students enrolled</p>
              <p className="text-sm text-muted-foreground">
                Students will appear here once they enroll
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Device Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classData.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.document}</TableCell>
                      <TableCell>
                        {student.device ? (
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-primary" />
                            <span className="text-sm text-primary font-medium">
                              {student.device.status}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No device
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.device && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResetStudentId(student.id)}
                          >
                            Reset Device
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Device Dialog */}
      <AlertDialog open={!!resetStudentId} onOpenChange={() => setResetStudentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Student Device</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the device association for this student. They will need to
              register a new device to mark attendance. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetDevice}
              disabled={isResetting}
              className="gradient-primary"
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Device'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassDetailPage;
