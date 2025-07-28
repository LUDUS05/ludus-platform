import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AdminRoutes from './pages/admin/AdminRoutes';
import ActivitiesPageComponent from './pages/ActivitiesPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import DashboardPage from './pages/DashboardPage';
import VendorProfilePage from './pages/VendorProfilePage';
import BookingPage from './pages/BookingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import ProfilePage from './pages/ProfilePage';
import HowItWorksPage from './pages/HowItWorksPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Temporary Home Page Component
const HomePage = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto container-padding py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to LUDUS
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover amazing local activities and experiences
        </p>
        <div className="space-x-4">
          <a href="/activities" className="btn-primary">
            Explore Activities
          </a>
          <a href="/register" className="btn-outline">
            Get Started
          </a>
        </div>
      </div>
    </div>
  </div>
);



// Admin Route Protection
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <AdminRoute>
                  <AdminRoutes />
                </AdminRoute>
              } 
            />
            
            {/* Regular Routes */}
            <Route path="/" element={
              <>
                <Header />
                <main>
                  <HomePage />
                </main>
              </>
            } />
            <Route path="/login" element={
              <>
                <Header />
                <main>
                  <LoginForm />
                </main>
              </>
            } />
            <Route path="/register" element={
              <>
                <Header />
                <main>
                  <RegisterForm />
                </main>
              </>
            } />
            <Route path="/activities" element={
              <>
                <Header />
                <main>
                  <ActivitiesPageComponent />
                </main>
              </>
            } />
            <Route path="/activities/:id" element={
              <>
                <Header />
                <main>
                  <ActivityDetailPage />
                </main>
              </>
            } />
            <Route path="/vendors/:id" element={
              <>
                <Header />
                <main>
                  <VendorProfilePage />
                </main>
              </>
            } />
            <Route path="/booking/:id" element={
              <>
                <Header />
                <main>
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                </main>
              </>
            } />
            <Route path="/payment/success/:paymentId" element={
              <>
                <Header />
                <main>
                  <ProtectedRoute>
                    <PaymentSuccessPage />
                  </ProtectedRoute>
                </main>
              </>
            } />
            <Route path="/payment/callback" element={
              <>
                <Header />
                <main>
                  <ProtectedRoute>
                    <PaymentSuccessPage />
                  </ProtectedRoute>
                </main>
              </>
            } />
            <Route 
              path="/dashboard" 
              element={
                <>
                  <Header />
                  <main>
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  </main>
                </>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <>
                  <Header />
                  <main>
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  </main>
                </>
              } 
            />
            <Route path="/how-it-works" element={
              <>
                <Header />
                <main>
                  <HowItWorksPage />
                </main>
              </>
            } />
            <Route path="/forgot-password" element={
              <>
                <Header />
                <main>
                  <ForgotPasswordPage />
                </main>
              </>
            } />
          </Routes>
        </div>
        <SpeedInsights />
      </Router>
    </AuthProvider>
  );
}

export default App;