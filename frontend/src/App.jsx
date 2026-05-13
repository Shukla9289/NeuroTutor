import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Quiz from './pages/Quiz';
import CodePlayground from './pages/CodePlayground';
import Progress from './pages/Progress';
import Notes from './pages/Notes';
import Login from './pages/Login';
import './App.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  // ✅ Wait for auth state before deciding to redirect
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <>
      {/* ✅ Only show Navbar on protected pages */}
      {user && <Navbar />}
      <main className={user ? 'main-content' : 'main-content main-content--public'}>
        {/* ✅ Single AnimatePresence, single Routes */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={
              <PageWrapper><Login /></PageWrapper>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <PageWrapper><Dashboard /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <PageWrapper><Chat /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/quiz" element={
              <ProtectedRoute>
                <PageWrapper><Quiz /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/code" element={
              <ProtectedRoute>
                <PageWrapper><CodePlayground /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute>
                <PageWrapper><Progress /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/notes" element={
              <ProtectedRoute>
                <PageWrapper><Notes /></PageWrapper>
              </ProtectedRoute>
            } />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="app-container">
            <AppLayout />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
