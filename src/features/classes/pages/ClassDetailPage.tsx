import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { classesApi } from '../api/classesApi';
import { Class } from '@/shared/types';
import { ArrowLeft, Users, Smartphone, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { generateQrToken, buildQrPayload } from '@/lib/qr';
import { registerQrForEvent, registerAttendance, getClassEvents } from '@/services/bff/teacherBff';
import { useAuth } from '@/features/auth/hooks/useAuth';

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
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span className="font-medium">
                  {classData.students?.length || 0} students
                </span>
              </div>
              <div>
                <Button
                  onClick={async () => {
                    // gerar token e payload para QR
                    const token = generateQrToken();
                    const payload = buildQrPayload(token, { classId: classData.id });
                    setQrToken(token);
                    setQrPayload(payload);
                    setShowQr(true);

                    // Tentar persistir no BFF se endpoint existir
                    try {
                      // pegar email do professor se disponível (para audit/tracing)
                      const teacher = useAuth.getState().teacher;
                      const meta = teacher ? { teacherEmail: teacher.email } : undefined;
                      await registerQrForEvent(Number(classData.id), token, meta);
                      toast.success('QR token gerado e registrado no BFF');
                    } catch (err: any) {
                      // Se o endpoint não existir ou falhar, apenas informar que o token foi gerado localmente
                      console.warn('Falha ao registrar token no BFF (pode não existir):', err);
                      toast('QR gerado (não registrado no BFF) — verifique o BFF se precisar de persistência');
                    }
                  }}
                >
                  Gerar QR de presença
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* QR Display */}
      {showQr && qrPayload && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>QR de Presença</CardTitle>
            <CardDescription>Mostre este QR para os alunos escanearem</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <div className="bg-white p-4 rounded-lg">
              <QRCode value={qrPayload} size={192} />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  // copiar payload para clipboard (pode ser usado pelo microfrontend do aluno)
                  if (qrPayload) {
                    navigator.clipboard.writeText(qrPayload);
                    toast.success('QR payload copiado para clipboard');
                  }
                }}
              >
                Copiar payload
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  // Botão de teste: simula um aluno escaneando o QR e registra presença.
                  try {
                    const payload = qrPayload ? JSON.parse(qrPayload) : null;
                    const token = payload?.t || qrToken;
                    if (!token) {
                      toast.error('Token não encontrado para simulação');
                      return;
                    }

                    // Buscar eventos reais da turma via BFF e registrar presença com qr_token
                    const events = await getClassEvents(Number(classData.id));
                    const ev = events && events.length > 0 ? events[0] : null;
                    const student = classData.students?.[0];
                    if (!ev) {
                      toast.error('Nenhum evento encontrado para esta turma');
                      return;
                    }
                    if (!student) {
                      toast.error('Nenhum aluno disponível para associar a presença');
                      return;
                    }

                    // registro de presença via BFF usando o qr_token
                    await registerAttendance({ qr_token: token, device_id: student.device?.deviceId ?? undefined, device_time: new Date().toISOString() });
                    toast.success('Presença registrada via BFF');
                  } catch (err: any) {
                    console.error(err);
                    toast.error('Falha ao simular presença: ' + (err?.message || String(err)));
                  }
                }}
              >
                Simular presença (teste)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowQr(false);
                  setQrPayload(null);
                  setQrToken(null);
                }}
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-primary" />
                                <span className="text-sm text-primary font-medium">{student.device.status}</span>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">MAC: <span className="font-mono">{student.device.deviceId}</span></div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No device</span>
                          )}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.device && (
                          <Button variant="outline" size="sm" onClick={() => setResetStudentId(student.id)}>
                            Remover dispositivo
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
            <AlertDialogTitle>Remover dispositivo</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá a associação do dispositivo para este aluno. Ele precisará cadastrar
              um novo dispositivo para marcar presença. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetDevice} disabled={isResetting} className="gradient-primary">
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                'Remover dispositivo'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassDetailPage;
