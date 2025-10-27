import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authApi } from '../api/authApi';
import { toast } from 'sonner';

const recoverSchema = z.object({
  teacher_email: z.string().email('Invalid email address'),
});

type RecoverFormData = z.infer<typeof recoverSchema>;

const RecoverPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecoverFormData>({
    resolver: zodResolver(recoverSchema),
  });

  const onSubmit = async (data: RecoverFormData) => {
    setIsSubmitting(true);
    try {
      await authApi.recoverPassword({ teacher_email: data.teacher_email });
      setSuccess(true);
      toast.success('Recovery email sent!');
      reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send recovery email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-md shadow-primary-lg">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-2xl font-bold">Recover Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-green-600 text-center py-4">Recovery email sent! Check your inbox.</div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher_email">Email</Label>
                <Input
                  id="teacher_email"
                  type="email"
                  placeholder="teacher@example.com"
                  {...register('teacher_email')}
                  disabled={isSubmitting}
                />
                {errors.teacher_email && (
                  <p className="text-sm text-destructive">{errors.teacher_email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary hover:opacity-90 transition-opacity"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Recovery Email'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecoverPasswordPage;
