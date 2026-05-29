import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import QuizPage from './pages/QuizPage';
import QuizCard from './pages/QuizCard';
import QuizResult from './pages/QuizResult';
import PastPapers from './pages/PastPapers';
import StudentProfile from './pages/StudentProfile';
import LeadingPage from './pages/LeadingPage';
import AdminLogin from './pages/admin/AdminLogin';
import ComponentLibraryDemo from './ui/ComponentLibraryDemo';

function PageTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const titles = {
      '/': 'Quiz Master',
      '/registration': 'Registration | Quiz Master',
      '/login': 'Student Login | Quiz Master',
      '/dashboard': 'Dashboard | Quiz Master',
      '/quizzes': 'Quiz Quest | Quiz Master',
      '/quiz-card': 'Mission Attempt | Quiz Master',
      '/past-papers': 'Past Papers | Quiz Master',
      '/leading': 'Leaderboard | Quiz Master',
      '/profile': 'Profile | Quiz Master',
      '/admin/login': 'Admin Login | Quiz Master',
      '/demo': 'Component Demo | Quiz Master',
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
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/quizzes" element={<QuizPage />} />
        <Route path="/quiz-card" element={<QuizCard />} />
        <Route path="/past-papers" element={<PastPapers />} />
        <Route path="/leading" element={<LeadingPage />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/demo" element={<ComponentLibraryDemo />} />
      </Routes>
    </Router>
  )
}

export default App