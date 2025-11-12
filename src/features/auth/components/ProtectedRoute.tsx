
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, initialized, isLoading } = useAuth();
  const location = useLocation();

  // Enquanto ainda inicializando (restaurando sessão), evita redirecionar
  if (!initialized || isLoading) {
    return <div className="flex items-center justify-center py-20"><span className="text-sm text-muted-foreground">Carregando sessão...</span></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
