import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletContextProvider } from './contexts/WalletContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StudyGroupProvider } from './contexts/StudyGroupContext';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import CreateGroup from './pages/CreateGroup';
import Profile from './pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-500"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/groups" element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          } />
          <Route path="/create-group" element={
            <ProtectedRoute>
              <CreateGroup />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
          }}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <WalletContextProvider>
      <AuthProvider>
        <StudyGroupProvider>
          <AppContent />
        </StudyGroupProvider>
      </AuthProvider>
    </WalletContextProvider>
  );
}

export default App;