import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Layout from './components/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Learn Mode Pages
import Courses from './pages/LearnMode/Courses';
import CourseTest from './pages/LearnMode/CourseTest';
import JobList from './pages/LearnMode/JobList';
import AppliedJobs from './pages/LearnMode/AppliedJobs';

// Build Mode Pages
import BuildWorkspace from './pages/BuildMode/BuildWorkspace';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// Protected Route with Layout
const ProtectedLayoutRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/dashboard" element={
              <ProtectedLayoutRoute>
                <Dashboard />
              </ProtectedLayoutRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedLayoutRoute>
                <Profile />
              </ProtectedLayoutRoute>
            } />
            
            {/* Learn Mode Routes */}
            <Route path="/courses" element={
              <ProtectedLayoutRoute>
                <Courses />
              </ProtectedLayoutRoute>
            } />
            
            <Route path="/courses/:courseName/test" element={
              <ProtectedLayoutRoute>
                <CourseTest />
              </ProtectedLayoutRoute>
            } />
            
            <Route path="/jobs" element={
              <ProtectedLayoutRoute>
                <JobList />
              </ProtectedLayoutRoute>
            } />
            
            <Route path="/applied-jobs" element={
              <ProtectedLayoutRoute>
                <AppliedJobs />
              </ProtectedLayoutRoute>
            } />
            
            {/* Build Mode Routes - BuildWorkspace has its own layout */}
            <Route path="/build" element={
              <ProtectedRoute>
                <BuildWorkspace />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
