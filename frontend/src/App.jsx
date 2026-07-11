import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgetPassWord from './pages/ForgetPassWord';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import QuizPage from './pages/QuizPage';
import QuizCard from './pages/QuizCard';
import QuizResult from './pages/QuizResult';
import PastPapers from './pages/PastPapers';
import StudentProfile from './pages/StudentProfile';
import LeadingPage from './pages/LeadingPage';
import ComponentLibraryDemo from './ui/ComponentLibraryDemo';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAddPasspaper from './pages/admin/AdminAddPasspaper';
import AdminUserManage from './pages/admin/AdminUserManage';
import AdminAddQuiz from './pages/admin/AdminAddQuiz';
import AdminLogin from './pages/admin/AdminLogin';
import Error405Page from './pages/errors/405error';
import Error401Page from './pages/errors/401error';
import Error404Page from './pages/errors/404error';
import Error403Page from './pages/errors/403error';
import Error500Page from './pages/errors/500error';
import { getAuthSession } from './services/authService';
import { Toast, useToast } from './ui/Toast';

function ProtectedRoute({ children }) {
  const session = getAuthSession();

  if (!session?.tokens?.accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PageTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const titles = {
      '/': 'Quiz Master',
      '/registration': 'Registration | Quiz Master',
      '/login': 'Student Login | Quiz Master',
      '/forgot-password': 'Forgot Password | Quiz Master',
      '/reset-password': 'Reset Password | Quiz Master',
      '/dashboard': 'Dashboard | Quiz Master',
      '/quizzes': 'Quiz Quest | Quiz Master',
      '/quiz-card': 'Mission Attempt | Quiz Master',
      '/past-papers': 'Past Papers | Quiz Master',
      '/leading': 'Leaderboard | Quiz Master',
      '/profile': 'Profile | Quiz Master',
      '/demo': 'Component Demo | Quiz Master',
      '/admin/login': 'Admin Login | Quiz Master',
      '/admin/dashboard': 'Admin Dashboard | Quiz Master',
      '/admin/past-papers': 'Past Papers | Quiz Master',
      '/admin/users': 'Manage Users | Quiz Master',
      '/admin/quizzes': 'Manage Quizzes | Quiz Master',
      '/403': 'Access Denied | Quiz Master',
    };

    document.title = titles[location.pathname] ?? 'Quiz Master';
  }, [location.pathname]);

  return null;
}

function App() {
  const toast = useToast();

  useEffect(() => {
    const handleBadgeEarned = (event) => {
      const badge = event.detail;
      toast.success(`🎉 Badge Unlocked: ${badge.name}! - ${badge.description}`, 5000);
    };

    window.addEventListener('badgeEarned', handleBadgeEarned);
    return () => {
      window.removeEventListener('badgeEarned', handleBadgeEarned);
    };
  }, [toast]);

  return (
    <Router>
      <PageTitleManager />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/registration" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgetPassWord />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-card"
          element={
            <ProtectedRoute>
              <QuizCard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/past-papers"
          element={
            <ProtectedRoute>
              <PastPapers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leading"
          element={
            <ProtectedRoute>
              <LeadingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/past-papers" element={<AdminAddPasspaper />} />
        <Route path="/admin/users" element={<AdminUserManage />} />
        <Route path="/admin/quizzes" element={<AdminAddQuiz />} />
        <Route path="/401" element={<Error401Page />} />
        <Route path="/403" element={<Error403Page />} />
        <Route path="/404" element={<Error404Page />} />
        <Route path="/405" element={<Error405Page />} />
        <Route path="/500" element={<Error500Page />} />
        <Route path="/demo" element={<ComponentLibraryDemo />} />
      </Routes>
      <div className="fixed z-50 space-y-3 top-4 right-4">
        {toast.toasts.map((item) => (
          <Toast
            key={item.id}
            type={item.type}
            message={item.message}
            duration={item.duration}
            onClose={() => toast.removeToast(item.id)}
          />
        ))}
      </div>
    </Router>
  )
}

export default App