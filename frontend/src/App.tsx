import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';

// Public pages
import { Landing } from './pages/public/Landing';
import { HowItWorks } from './pages/public/HowItWorks';
import { Features } from './pages/public/Features';

// Auth pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';

// Citizen pages
import { CitizenDashboard } from './pages/citizen/Dashboard';
import { Report } from './pages/citizen/Report';
import { MyIssues } from './pages/citizen/MyIssues';

// Staff pages
import { StaffDashboard } from './pages/staff/Dashboard';
import { AssignedIssues } from './pages/staff/AssignedIssues';

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminIssues } from './pages/admin/Issues';
import { Analytics } from './pages/admin/Analytics';
import { Users } from './pages/admin/Users';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
            <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
            <Route path="/features" element={<PublicLayout><Features /></PublicLayout>} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Citizen routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <AppLayout><CitizenDashboard /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/report"
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <AppLayout><Report /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/issues"
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <AppLayout><MyIssues /></AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Staff routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <AppLayout><StaffDashboard /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/issues"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <AppLayout><AssignedIssues /></AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout><AdminDashboard /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/issues"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout><AdminIssues /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout><Analytics /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout><Users /></AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
