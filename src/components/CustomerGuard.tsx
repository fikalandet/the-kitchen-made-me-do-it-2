import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface CustomerGuardProps {
  children: React.ReactNode;
}

const CustomerGuard: React.FC<CustomerGuardProps> = ({ children }) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', {
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#a1c798' }}>
        <div style={{ backgroundColor: '#f6f2e0' }} className="p-8 rounded-lg">
          <p className="text-gray-600">Läser in...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (userRole !== 'buyer') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default CustomerGuard;
