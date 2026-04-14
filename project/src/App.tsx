import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import SymptomChecker from './components/symptom-checker/SymptomChecker';
import AIAssistant from './components/ai-assistant/AIAssistant';
import Appointments from './components/appointments/Appointments';
import FileUpload from './components/file-upload/FileUpload';
import Profile from './components/profile/Profile';
import MedicalAnalyzer from './components/medical-analyzer/MedicalAnalyzer';
import Navbar from './components/layout/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BreathAI from './components/BreatAI/breathai';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/breathanalysis"
            element={user ? <BreathAI/> : <Navigate to="/login" />}
          />
          <Route
            path="/symptom-checker"
            element={user ? <SymptomChecker /> : <Navigate to="/login" />}
          />
          <Route
            path="/ai-assistant"
            element={user ? <AIAssistant /> : <Navigate to="/login" />}
          />
          <Route
            path="/appointments"
            element={user ? <Appointments /> : <Navigate to="/login" />}
          />
          <Route
            path="/file-upload"
            element={user ? <FileUpload /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/medical-analyzer"
            element={user ? <MedicalAnalyzer /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={user ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;