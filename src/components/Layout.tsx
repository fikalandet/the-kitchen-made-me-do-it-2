import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BarChart3, Home, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#a1c798' }}>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="font-lobster text-2xl text-gray-800">
            GuldsKöket
          </Link>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {showSidebar && userRole && (
          <aside className="w-64" style={{ backgroundColor: '#f6f2e0' }}>
            <nav className="p-4 space-y-2">
              {userRole === 'buyer' && (
                <>
                  <NavLink to="/" icon={Home} label="Startsida" active={location.pathname === '/'} />
                  <NavLink to="/orders" icon={BarChart3} label="Mina Beställningar" active={location.pathname === '/orders'} />
                  <NavLink to="/messages" icon={Users} label="Meddelanden" active={location.pathname === '/messages'} />
                </>
              )}
              {userRole === 'seller' && (
                <>
                  <NavLink to="/" icon={Home} label="Startsida" active={location.pathname === '/'} />
                  <NavLink to="/chef-panel" icon={BarChart3} label="Kockpanel" active={location.pathname === '/chef-panel'} />
                  <NavLink to="/messages" icon={Users} label="Meddelanden" active={location.pathname === '/messages'} />
                </>
              )}
              {userRole === 'admin' && (
                <>
                  <NavLink to="/admin" icon={BarChart3} label="Admin Panel" active={location.pathname === '/admin'} />
                  <NavLink to="/messages" icon={Users} label="Meddelanden" active={location.pathname === '/messages'} />
                </>
              )}
            </nav>
          </aside>
        )}

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  icon: any;
  label: string;
  active: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-2 rounded text-sm font-medium transition-colors ${
      active
        ? 'bg-white text-gray-900'
        : 'text-gray-700 hover:bg-white hover:bg-opacity-50'
    }`}
  >
    <Icon size={20} />
    {label}
  </Link>
);
