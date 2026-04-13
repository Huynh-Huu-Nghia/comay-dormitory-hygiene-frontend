// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';

// Core component: Eagerly loaded to prevent authentication delays
import ProtectedRoute from './ProtectedRoute';

// Route-level Code Splitting: Lazy loading chunks to optimize initial bundle size
const Login = lazy(() => import('./pages/auth/Login'));
const StudentHome = lazy(() => import('./pages/student/StudentHome'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

/**
 * @component PageLoader
 * @description Global fallback UI displayed while React suspends to fetch route chunks.
 */
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="text-lg font-semibold text-green-600 animate-pulse">
      Đang tải hệ thống...
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* Global Toast Notification Configuration */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      
      {/* Suspense Boundary: Handles asynchronous chunk loading states */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes - Student Domain */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentHome />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes - Admin Domain */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;