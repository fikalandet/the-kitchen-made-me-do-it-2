import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { PublicLayout } from './components/PublicLayout';
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { MarketplaceFilter } from './pages/MarketplaceFilter';
import { NewChefPanel } from './pages/NewChefPanel';
import { ProductForm } from './pages/ProductForm';
import { Membership } from './pages/Membership';
import { BecomeChef } from './pages/BecomeChef';
import { GoldenSpoon } from './pages/GoldenSpoon';
import { EditorialCategory } from './pages/EditorialCategory';
import { StaticPage } from './pages/StaticPage';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { FAQ } from './pages/FAQ';
import { LandingPage } from './pages/LandingPage';
import AdminLayout from './admin/AdminLayout';
import AdminGuard from './admin/AdminGuard';
import Dashboard from './admin/dashboard';
import Kockar from './admin/kockar';
import ChefDetail from './admin/kockar/ChefDetail';
import Kunder from './admin/kunder';
import Produkter from './admin/produkter';
import Kommunikation from './admin/kommunikation';
import Marknadsforing from './admin/marknadsforing';
import Ekonomi from './admin/ekonomi';
import RodaFlaggor from './admin/rodaflaggor';
import Webbsidan from './admin/webb';
import System from './admin/system';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path="/hitta-kak"
        element={
          <PublicLayout>
            <Marketplace />
          </PublicLayout>
        }
      />
      <Route
        path="/filtrera-fram"
        element={
          <PublicLayout>
            <MarketplaceFilter />
          </PublicLayout>
        }
      />
      <Route
        path="/bli-kock"
        element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        }
      />
      <Route
        path="/guldskeden"
        element={
          <PublicLayout>
            <GoldenSpoon />
          </PublicLayout>
        }
      />
      <Route
        path="/redaktion/:slug"
        element={
          <PublicLayout>
            <EditorialCategory />
          </PublicLayout>
        }
      />
      <Route
        path="/om-oss"
        element={
          <PublicLayout>
            <AboutUs />
          </PublicLayout>
        }
      />
      <Route
        path="/kontakta-oss"
        element={
          <PublicLayout>
            <ContactUs />
          </PublicLayout>
        }
      />
      <Route
        path="/samarbeten"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/sa-funkar-det"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/faq"
        element={
          <PublicLayout>
            <FAQ />
          </PublicLayout>
        }
      />
      <Route
        path="/blogg"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/vara-kockar"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/kock-i-fokus"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/butik"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/policys-villkor"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/hallbarhet"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/press"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/halsokak"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/en-sked-for-mamma"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/koksknep"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/vardagsmat"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/for-hela-familjen"
        element={
          <PublicLayout>
            <StaticPage />
          </PublicLayout>
        }
      />
      <Route
        path="/chef-panel"
        element={
          <ProtectedRoute>
            <NewChefPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/new"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <ProductForm />
            </PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/edit/:id"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <ProductForm />
            </PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/membership"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <Membership />
            </PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="kockar" element={<Kockar />} />
        <Route path="kockar/:id" element={<ChefDetail />} />
        <Route path="kunder" element={<Kunder />} />
        <Route path="produkter" element={<Produkter />} />
        <Route path="kommunikation" element={<Kommunikation />} />
        <Route path="marknadsforing" element={<Marknadsforing />} />
        <Route path="ekonomi" element={<Ekonomi />} />
        <Route path="rodaflaggor" element={<RodaFlaggor />} />
        <Route path="webb/*" element={<Webbsidan />} />
        <Route path="system" element={<System />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
