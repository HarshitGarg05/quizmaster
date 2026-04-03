import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { NotificationProvider } from './context/NotificationContext';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ExploreQuizzes from './pages/ExploreQuizzes';
import QuizPlayer from './pages/QuizPlayer';
import Results from './pages/Results';
import Review from './pages/Review';
import AdminDashboard from './pages/AdminDashboard';
import QuizCreator from './pages/QuizCreator';
import Leaderboard from './pages/Leaderboard';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 editorial-gradient rounded-full animate-ping opacity-20"></div>
        <div className="relative w-full h-full border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

function AppContent() {
  const { pathname } = useLocation();
  const hideFooterRoutes = ['/login', '/register'];
  const isQuizRoute = pathname.startsWith('/quiz/');
  const shouldHideFooter = hideFooterRoutes.includes(pathname) || isQuizRoute;

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/20 text-on-surface transition-colors duration-500 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explore" element={<ExploreQuizzes />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Student Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/quiz/:id" element={<ProtectedRoute><QuizPlayer /></ProtectedRoute>} />
          <Route path="/results/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/review/:id" element={<ProtectedRoute><Review /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/quiz/create" element={<ProtectedRoute role="Admin"><QuizCreator /></ProtectedRoute>} />
          <Route path="/admin/quiz/edit/:id" element={<ProtectedRoute role="Admin"><QuizCreator /></ProtectedRoute>} />
        </Routes>
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
