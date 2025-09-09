import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import ErrorBoundary from './components/ErrorBoundary';
import { Navbar } from './components/layout/navbar';
import ProtectedRoute from './components/ProtectedRoute';


// Import all migrated pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboardClean';
import StoresPage from './pages/StoresPage';
import StoreDetailPage from './pages/StoreDetailPage';
import StoreDashboard from './pages/StoreDashboard';
import StoreEditPage from './pages/StoreEditPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Import UI components for global usage
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider defaultTheme="system" storageKey="store-ui-theme">
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Suspense fallback={<div>Loading...</div>}>
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/stores" element={<StoresPage />} />
                  <Route path="/store/:storeId" element={<StoreDetailPage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  
                  {/* Protected User Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Protected Store Routes */}
                  <Route path="/store/dashboard" element={
                    <ProtectedRoute>
                      <StoreDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/store/edit" element={
                    <ProtectedRoute>
                      <StoreEditPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Protected Admin Routes */}
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 Route */}
                  <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
                        <p className="text-xl text-muted-foreground mt-4">Page not found</p>
                        <a href="/" className="text-accent hover:text-accent/80 mt-4 inline-block">
                          Go back home
                        </a>
                      </div>
                    </div>
                  } />
                </Routes>
              </main>
              <Toaster />
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  </HelmetProvider>
</ErrorBoundary>
  );
}

export default App;
