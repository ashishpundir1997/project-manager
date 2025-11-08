import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users } from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="text-2xl font-bold text-primary">
              Project Manager
            </Link>
            <div className="flex gap-2">
              <Link to="/dashboard">
                <Button
                  variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/team">
                <Button
                  variant={location.pathname === '/team' ? 'default' : 'ghost'}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}

