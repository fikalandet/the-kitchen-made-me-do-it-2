import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, userRole, loading } = useAuth();

  console.log('AdminGuard - userRole:', userRole, 'user email:', user?.email);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-gray-600">Läser in...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = userRole === 'admin' || user.email === 'admin@kitchen.food';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Åtkomst nekad</h1>
          <p className="text-gray-600 mb-6">
            Du har inte behörighet att se denna sida. Denna sektion är endast tillgänglig för administratörer.
          </p>
          <a
            href="/"
            className="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Tillbaka till startsidan
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
