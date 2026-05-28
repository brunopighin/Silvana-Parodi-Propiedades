import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/ui/WhatsAppButton';
import ScrollToTop from './components/ui/ScrollToTop';

// Public pages
import Home from './pages/public/Home';
import Properties from './pages/public/Properties';
import PropertyDetail from './pages/public/PropertyDetail';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Services from './pages/public/Services';
import NotFound from './pages/public/NotFound';

// Admin pages
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import PropertiesList from './pages/admin/PropertiesList';
import PropertyForm from './pages/admin/PropertyForm';
import Inquiries from './pages/admin/Inquiries';
import Testimonials from './pages/admin/Testimonials';
import AdminSettings from './pages/admin/Settings';

function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="animate-spin w-8 h-8 text-primary-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

function PublicLayout({ children }) {
  const { pathname } = useLocation();
  return (
    <>
      <Header />
      <main key={pathname} className="page-3d-enter">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/propiedades" element={<PublicLayout><Properties /></PublicLayout>} />
      <Route path="/propiedad/:slug" element={<PublicLayout><PropertyDetail /></PublicLayout>} />
      <Route path="/servicios" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/nosotros" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/contacto" element={<PublicLayout><Contact /></PublicLayout>} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/propiedades" element={<ProtectedRoute><PropertiesList /></ProtectedRoute>} />
      <Route path="/admin/propiedades/nueva" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
      <Route path="/admin/propiedades/:id" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
      <Route path="/admin/consultas" element={<ProtectedRoute><Inquiries /></ProtectedRoute>} />
      <Route path="/admin/testimonios" element={<ProtectedRoute><Testimonials /></ProtectedRoute>} />
      <Route path="/admin/configuracion" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
    </>
  );
}
