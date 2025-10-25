import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { classesApi } from '../api/classesApi';
import { Class } from '@/shared/types';
import { Users, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const ClassesPage = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="shadow-sm hover:shadow-primary transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{classItem.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Code: {classItem.code}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {classItem.students?.length || 0} students
                  </span>
                </div>

                <Link to={`/classes/${classItem.id}`}>
                  <Button className="w-full gradient-primary group">
                    View Details
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
