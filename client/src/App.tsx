import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useStudentAuth } from './contexts/StudentAuthContext';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import CoursesPage from './pages/public/CoursesPage';
import ServicesPage from './pages/public/ServicesPage';
import BookDemoPage from './pages/public/BookDemoPage';
import ContactPage from './pages/public/ContactPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import StudentDetail from './pages/admin/StudentDetail';
import Attendance from './pages/admin/Attendance';
import AttendanceReports from './pages/admin/AttendanceReports';
import Lessons from './pages/admin/Lessons';
import DemoBookings from './pages/admin/DemoBookings';
import ServiceRequests from './pages/admin/ServiceRequests';
import Payments from './pages/admin/Payments';
import Settings from './pages/admin/Settings';
import StaffManagement from './pages/admin/StaffManagement';
import StudentLogin from './pages/student/StudentLogin';
import StudentPortal from './pages/student/StudentPortal';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function ProtectedStudentRoute({ children }: { children: React.ReactNode }) {
  const { student, loading } = useStudentAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-[3px] border-accent-600"></div>
      </div>
    );
  }

  if (!student) {
    return <Navigate to="/student/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/book-demo" element={<BookDemoPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Route>

      {/* Student portal */}
      <Route path="/student/login" element={<StudentLogin />} />
      <Route
        path="/student/portal"
        element={
          <ProtectedStudentRoute>
            <StudentPortal />
          </ProtectedStudentRoute>
        }
      />

      {/* Admin login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="attendance/reports" element={<AttendanceReports />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="demo-bookings" element={<DemoBookings />} />
        <Route path="service-requests" element={<ServiceRequests />} />
        <Route path="payments" element={<Payments />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="staff"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffManagement />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
