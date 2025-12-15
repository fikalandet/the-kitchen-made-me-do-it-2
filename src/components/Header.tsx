import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Home, ChevronDown, UserPlus, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header style={{ backgroundColor: '#a1c798' }}>
      <div className="bg-gray-900 text-white py-1.5">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs text-center">
            Här hittar du grymt käk tillagat av hemmakockar i ditt närområde.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end gap-4 pb-1">
          <Link to="/" className="flex-shrink-0 pb-0">
            <img
              src="/Logotyp plattformen. svenska.png"
              alt="The Kitchen Made Me Do It"
              className="h-auto w-auto max-h-48 block"
            />
          </Link>

          <nav className="flex items-center justify-center gap-2 flex-1 sticky top-0 z-50" style={{ backgroundColor: '#a1c798' }}>
          <Link
            to="/"
            className={`flex items-center justify-center p-2 rounded-full font-medium transition-all hover:shadow-lg text-xs ${
              isActive('/') ? 'shadow-md' : ''
            }`}
            style={{
              backgroundColor: isActive('/') ? 'white' : '#f6f2e0',
              color: '#2d3748'
            }}
          >
            <Home size={16} />
          </Link>
          <Link
            to="/bli-kock"
            className={`px-2.5 py-1 rounded-full font-medium transition-all hover:shadow-lg text-xs ${
              isActive('/bli-kock') ? 'shadow-md' : ''
            }`}
            style={{
              backgroundColor: isActive('/bli-kock') ? 'white' : '#f6f2e0',
              color: '#2d3748'
            }}
          >
            Bli kock
          </Link>
          <Link
            to="/guldskeden"
            className={`px-2.5 py-1 rounded-full font-medium transition-all hover:shadow-lg text-xs ${
              isActive('/guldskeden') ? 'shadow-md' : ''
            }`}
            style={{
              backgroundColor: isActive('/guldskeden') ? 'white' : '#f6f2e0',
              color: '#2d3748'
            }}
          >
            Guldskeden
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all hover:opacity-90 relative text-xs"
            style={{ backgroundColor: '#1a1a1a', color: 'white' }}
          >
            <span>Meny</span>
            <ChevronDown size={12} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />

            {menuOpen && (
              <div
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded-lg shadow-lg py-2 min-w-[180px]"
                style={{ backgroundColor: '#f6f2e0' }}
              >
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-white transition-colors font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    Adminpanel
                  </Link>
                )}
                <Link
                  to="/chef-panel"
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Kockpanel
                </Link>
                <Link
                  to="/membership"
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Medlemskap
                </Link>
                <Link
                  to="/om-oss"
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Om oss
                </Link>
                <Link
                  to="/kontakta-oss"
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Kontakta oss
                </Link>
                <Link
                  to="/faq"
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  FAQ
                </Link>
              </div>
            )}
          </button>
          </nav>

          <div className="flex items-center gap-2 sticky top-0 z-50" style={{ backgroundColor: '#a1c798' }}>
              {user ? (
                <>
                  <span className="text-xs text-gray-800 mr-1">{user.email}</span>
                  <button
                    onClick={() => {
                      if (userRole === 'admin') {
                        navigate('/admin');
                      } else {
                        navigate('/chef-panel');
                      }
                    }}
                    className="px-3 py-1.5 rounded-full font-medium transition-all hover:shadow-lg text-xs"
                    style={{ backgroundColor: '#f6f2e0', color: '#2d3748' }}
                  >
                    Min Panel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-full transition-all hover:bg-white hover:bg-opacity-20"
                    style={{ color: '#2d3748' }}
                    title="Logga ut"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login?mode=signup')}
                    className="p-1.5 rounded-full transition-all hover:bg-white hover:bg-opacity-20"
                    style={{ color: '#2d3748' }}
                    title="Bli medlem"
                  >
                    <UserPlus size={20} />
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="p-1.5 rounded-full transition-all hover:bg-white hover:bg-opacity-20"
                    style={{ color: '#2d3748' }}
                    title="Logga in"
                  >
                    <LogIn size={20} />
                  </button>
                </>
              )}
              <button
                className="p-1.5 rounded-full transition-all hover:bg-white hover:bg-opacity-20"
                style={{ color: '#2d3748' }}
                title="Varukorg"
              >
                <ShoppingCart size={20} />
              </button>
          </div>
        </div>
      </div>
    </header>
  );
};
