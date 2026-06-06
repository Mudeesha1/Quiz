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
      '/admin/dashboard': 'Admin Dashboard | Quiz Master',
    };

    document.title = titles[location.pathname] ?? 'Quiz Master';
  }, [location.pathname]);

  return null;
}

function App() {
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
        <Route path="/demo" element={<ComponentLibraryDemo />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App