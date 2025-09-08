import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Import components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StoresPage from './pages/StoresPage';
import StoreDetailPage from './pages/StoreDetailPage';
import AdminDashboard from './pages/AdminDashboardClean';
import StoreDashboard from './pages/StoreDashboard';
import StoreEditPage from './pages/StoreEditPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/stores" 
            element={
              <>
                <Navbar />
                <StoresPage />
              </>
            } 
          />
          <Route 
            path="/store/:storeId" 
            element={
              <>
                <Navbar />
                <StoreDetailPage />
              </>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <>
                <Navbar />
                <AdminDashboard />
              </>
            } 
          />
          <Route 
            path="/store/dashboard" 
            element={
              <>
                <Navbar />
                <ErrorBoundary>
                  <StoreDashboard />
                </ErrorBoundary>
              </>
            } 
          />
          <Route 
            path="/store/edit" 
            element={
              <>
                <Navbar />
                <ErrorBoundary>
                  <StoreEditPage />
                </ErrorBoundary>
              </>
            } 
          />
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-400">404</h1>
                  <p className="text-xl text-gray-600 mt-4">Page not found</p>
                  <a href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                    Go back home
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
