import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  BarChart3,
  LogOut,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { teacher, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/classes', label: 'Classes', icon: Users },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/attendances', label: 'Attendances', icon: ClipboardCheck },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AKI! Teacher</h1>
              <p className="text-sm text-muted-foreground">{teacher?.name}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card hidden md:block">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    className={`w-full justify-start gap-3 ${
                      isActive(item.path) ? 'gradient-primary' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t py-2 px-4 flex justify-around items-center z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full flex flex-col gap-1 h-auto py-2 ${
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
