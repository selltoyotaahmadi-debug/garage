import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import MechanicDashboard from './components/MechanicDashboard';
import WarehouseDashboard from './components/WarehouseDashboard';
import VehicleDetailPage from './components/vehicles/VehicleDetailPage';
import { JobCardDetail } from './components/jobcards/JobCardDetail';
import { JobCardManagement } from './components/jobcards/JobCardManagement';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingScreen from './components/common/LoadingScreen';
import Notifications from './components/Notifications';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function AppContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: dataLoading, error } = useData();
  
  // نمایش صفحه بارگذاری
  if (authLoading || dataLoading) {
    return <LoadingScreen message="در حال بارگذاری سیستم..." />;
  }
  
  // نمایش خطا
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">خطا در بارگذاری</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }
    
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
        <Routes>
          {/* Login Route */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to={`/${user?.role}`} replace />
              ) : (
                <LoginPage />
              )
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/vehicles/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <VehicleDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/jobcards" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <JobCardManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/jobcards/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <JobCardDetail />
              </ProtectedRoute>
            } 
          />
          
          {/* Mechanic Routes */}
          <Route 
            path="/mechanic" 
            element={
              <ProtectedRoute allowedRoles={['mechanic']}>
                <MechanicDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mechanic/vehicles/:id" 
            element={
              <ProtectedRoute allowedRoles={['mechanic']}>
                <VehicleDetailPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Warehouse Routes */}
          <Route 
            path="/warehouse" 
            element={
              <ProtectedRoute allowedRoles={['warehouse']}>
                <WarehouseDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Default Route */}
          <Route 
            path="/" 
            element={
              isAuthenticated && user ? (
                <Navigate to={`/${user.role}`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated && user ? `/${user.role}` : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <NotificationProvider>
          <ToastContainer
            position="top-left"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <AppContent />
          <PWAInstallPrompt />
        </NotificationProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;