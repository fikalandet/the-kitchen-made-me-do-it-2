import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ChefHat, Award, Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navigation: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { userRole } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-24 z-40 shadow-sm" style={{ backgroundColor: '#a1c798' }}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <NavButton
            to="/"
            icon={<Home size={20} />}
            label=""
            active={isActive('/')}
          />
          <NavButton
            to="/hitta-kak"
            icon={<Search size={20} />}
            label="Hitta käk"
            active={isActive('/hitta-kak')}
          />
          <NavButton
            to="/bli-kock"
            icon={<ChefHat size={20} />}
            label="Bli kock"
            active={isActive('/bli-kock')}
          />
          <NavButton
            to="/guldskeden"
            icon={<Award size={20} />}
            label="Guldskeden"
            active={isActive('/guldskeden')}
          />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:opacity-90 relative text-sm"
            style={{ backgroundColor: '#1a1a1a', color: 'white' }}
          >
            <Menu size={20} />
            <span>Meny+</span>
            <ChevronDown size={16} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />

            {menuOpen && (
              <div
                className="absolute top-full mt-2 right-0 rounded-lg shadow-lg py-2 min-w-[200px]"
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
              </div>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

interface NavButtonProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:shadow-lg text-sm ${
      active ? 'shadow-md' : ''
    }`}
    style={{
      backgroundColor: active ? 'white' : '#f6f2e0',
      color: '#2d3748'
    }}
  >
    {icon}
    {label && <span>{label}</span>}
  </Link>
);
