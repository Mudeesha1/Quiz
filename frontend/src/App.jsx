import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import QuizPage from './pages/QuizPage';
import PastPapers from './pages/PastPapers';
import StudentProfile from './pages/StudentProfile';
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
      '/past-papers': 'Past Papers | Quiz Master',
      '/profile': 'Profile | Quiz Master',
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
        <Route path="/past-papers" element={<PastPapers />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/demo" element={<ComponentLibraryDemo />} />
      </Routes>
    </Router>
  )
}

export default App