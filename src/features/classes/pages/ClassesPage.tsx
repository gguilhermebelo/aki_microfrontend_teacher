import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { classesApi } from '../api/classesApi';
import { Class } from '@/shared/types';
import { Users, Loader2, ChevronRight, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


const ClassesPage = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [expandedClassData, setExpandedClassData] = useState<Class | null>(null);
  const [isExpLoading, setIsExpLoading] = useState(false);
  const [resetStudentId, setResetStudentId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const data = await classesApi.getMyClasses();
      setClasses(data);
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = async (classId: string) => {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
      setExpandedClassData(null);
      return;
    }

    setIsExpLoading(true);
    try {
      const data = await classesApi.getClassById(classId);
      setExpandedClassData(data);
      setExpandedClassId(classId);
    } catch (err) {
      toast.error('Failed to load class students');
    } finally {
      setIsExpLoading(false);
    }
  };

  const removeDevice = async (studentId: string) => {
    // open confirmation dialog
    setResetStudentId(studentId);
  };

  const handleResetDevice = async () => {
    if (!resetStudentId) return;
    setIsResetting(true);
    try {
      await classesApi.resetStudentDevice(resetStudentId);
      toast.success('Dispositivo removido');
      // refresh expanded class data and list
      if (expandedClassId) {
        const updated = await classesApi.getClassById(expandedClassId);
        setExpandedClassData(updated);
      }
      loadClasses();
      setResetStudentId(null);
    } catch (err) {
      toast.error('Falha ao remover dispositivo');
    } finally {
      setIsResetting(false);
    }
  };

  const specialClass = classes.find((c) => (c.name || '').toLowerCase().includes('turma u bes'));

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
          <h1 className="text-3xl font-bold">My Classes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your classes and students
          </p>
        </div>
      </div>

      {classes.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No classes found</p>
            <p className="text-sm text-muted-foreground">
              You don't have any classes assigned yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {/* highlight Turma U BES if present */}
            {specialClass && (
              <Card key={specialClass.id} className="shadow-md border-2 border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">Turma U BES</CardTitle>
                      <CardDescription className="mt-1">Code: {specialClass.code}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-5 w-5" />
                      <span className="font-medium">{specialClass.students?.length || 0} students</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleExpand(specialClass.id)}>
                      {expandedClassId === specialClass.id ? 'Fechar turma' : 'Abrir turma'}
                    </Button>
                    <Link to={`/classes/${specialClass.id}`} className="flex-1">
                      <Button className="w-full gradient-primary group">
                        View Details
                        <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>

                  {expandedClassId === specialClass.id && (
                    <div className="mt-3 border rounded-md p-3 bg-muted/5">
                      {isExpLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : !expandedClassData || !expandedClassData.students || expandedClassData.students.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No students enrolled in this class.</p>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Document</TableHead>
                                <TableHead>Device MAC</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {expandedClassData.students.map((s) => (
                                <TableRow key={s.id}>
                                  <TableCell className="font-medium">{s.name}</TableCell>
                                  <TableCell>{s.email}</TableCell>
                                  <TableCell>{s.document}</TableCell>
                                  <TableCell><span className="font-mono">{s.device?.deviceId || '—'}</span></TableCell>
                                  <TableCell className="text-right">
                                    {s.device ? (
                                      <Button variant="destructive" size="sm" onClick={() => setResetStudentId(s.id)}>Remover dispositivo</Button>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">No device</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="shadow-sm hover:shadow-primary transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{classItem.name}</CardTitle>
                      <CardDescription className="mt-1">Code: {classItem.code}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">{classItem.students?.length || 0} students</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleExpand(classItem.id)}>
                        {expandedClassId === classItem.id ? 'Fechar turma' : 'Abrir turma'}
                      </Button>

                      <Link to={`/classes/${classItem.id}`} className="flex-1">
                        <Button className="w-full gradient-primary group">
                          View Details
                          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>

                    {expandedClassId === classItem.id && (
                      <div className="mt-3 border rounded-md p-3 bg-muted/5">
                        {isExpLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : !expandedClassData || !expandedClassData.students || expandedClassData.students.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No students enrolled in this class.</p>
                        ) : (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Document</TableHead>
                                  <TableHead>Device MAC</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {expandedClassData.students.map((s) => (
                                  <TableRow key={s.id}>
                                    <TableCell className="font-medium">{s.name}</TableCell>
                                    <TableCell>{s.email}</TableCell>
                                    <TableCell>{s.document}</TableCell>
                                    <TableCell><span className="font-mono">{s.device?.deviceId || '—'}</span></TableCell>
                                    <TableCell className="text-right">
                                      {s.device ? (
                                        <Button variant="destructive" size="sm" onClick={() => setResetStudentId(s.id)}>Remover dispositivo</Button>
                                      ) : (
                                        <span className="text-sm text-muted-foreground">No device</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Reset Device Dialog (Classes list) */}
      <AlertDialog open={!!resetStudentId} onOpenChange={() => setResetStudentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover dispositivo</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá a associação do dispositivo cadastrado para este aluno. Ele precisará
              registrar um novo dispositivo para marcar presença. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetDevice} disabled={isResetting} className="gradient-primary">
              {isResetting ? 'Removendo...' : 'Remover dispositivo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassesPage;
