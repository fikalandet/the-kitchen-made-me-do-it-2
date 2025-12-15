import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const Points: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="rounded-lg p-8 shadow-sm" style={{ backgroundColor: '#f6f2e0' }}>
      <h1 className="font-lobster text-4xl mb-4" style={{ color: '#000000' }}>
        Poäng & belöningar
      </h1>

      <p className="text-lg mb-6" style={{ color: '#666666' }}>
        Välkommen, {user?.email || 'Kund'}!
      </p>

      <p className="text-base" style={{ color: '#666666' }}>
        Innehåll kommer snart.
      </p>
    </div>
  );
};
