import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
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
import UIShowcasePage from './pages/UIShowcasePage';
import PartnerRegistrationPage from './pages/PartnerRegistrationPage';
import UserRegistrationPage from './pages/UserRegistrationPage';
import ComingSoonPage from './pages/ComingSoonPage';
import MaintenancePage from './pages/MaintenancePage';
import MapPage from './pages/MapPage';
import WalletPage from './pages/WalletPage';
import DynamicPage from './components/pages/DynamicPage';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-white dark:dark-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-ludus-orange dark:border-dark-ludus-orange border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Home Page Component
const HomePage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-soft-white dark:dark-bg-primary">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto container-padding py-20">
        <div className="text-center">
          <h1 className="text-display-xl font-bold text-charcoal dark:dark-text-primary mb-6">
            {t('home.welcomeTitle')}
          </h1>
          <p className="text-body-lg text-charcoal-light dark:dark-text-secondary mb-12 max-w-2xl mx-auto">
            {t('home.welcomeSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/activities" className="btn-primary btn-lg">
              {t('home.exploreActivities')}
            </a>
            <a href="/register" className="btn-secondary btn-lg">
              {t('home.getStarted')}
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-dark-bg-secondary py-20">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-display-lg font-bold text-charcoal dark:dark-text-primary mb-4">
              Why Choose LUDUS?
            </h2>
            <p className="text-body-md text-charcoal-light dark:dark-text-secondary max-w-2xl mx-auto">
              Discover unique experiences and connect with local activity providers across Saudi Arabia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-ludus-orange/10 dark:bg-dark-ludus-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-body-lg font-semibold text-charcoal dark:dark-text-primary mb-3">
                Curated Experiences
              </h3>
              <p className="text-body-md text-charcoal-light dark:dark-text-secondary">
                Handpicked activities from trusted local providers to ensure quality and authenticity
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-ludus-orange/10 dark:bg-dark-ludus-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-body-lg font-semibold text-charcoal dark:dark-text-primary mb-3">
                Transparent Pricing
              </h3>
              <p className="text-body-md text-charcoal-light dark:dark-text-secondary">
                Clear, upfront pricing in Saudi Riyals with secure payment processing through Moyasar
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-ludus-orange/10 dark:bg-dark-ludus-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-body-lg font-semibold text-charcoal dark:dark-text-primary mb-3">
                Easy Booking
              </h3>
              <p className="text-body-md text-charcoal-light dark:dark-text-secondary">
                Simple, mobile-friendly booking process with instant confirmation and digital receipts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-ludus-orange dark:bg-dark-ludus-orange py-16">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-display-md font-bold text-white mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-body-lg text-white/90 mb-8">
            Join thousands of explorers discovering amazing activities across Saudi Arabia
          </p>
          <a href="/activities" className="btn-white btn-lg">
            Explore Activities Now
          </a>
        </div>
      </div>
    </div>
  );
};



// Admin Route Protection
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-white dark:dark-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-ludus-orange dark:border-dark-ludus-orange border-t-transparent"></div>
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
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-soft-white dark:dark-bg-primary text-charcoal dark:dark-text-primary transition-colors duration-300">
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
                <Footer />
              </>
            } />
            <Route path="/login" element={
              <>
                <Header />
                <main>
                  <LoginForm />
                </main>
                <Footer />
              </>
            } />
            <Route path="/register" element={
              <UserRegistrationPage />
            } />
            <Route path="/activities" element={
              <>
                <Header />
                <main>
                  <ActivitiesPageComponent />
                </main>
                <Footer />
              </>
            } />
            <Route path="/activities/:id" element={
              <>
                <Header />
                <main>
                  <ActivityDetailPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/vendors/:id" element={
              <>
                <Header />
                <main>
                  <VendorProfilePage />
                </main>
                <Footer />
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
                <Footer />
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
                <Footer />
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
                <Footer />
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
                  <Footer />
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
                  <Footer />
                </>
              } 
            />
            <Route path="/how-it-works" element={
              <>
                <Header />
                <main>
                  <HowItWorksPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/forgot-password" element={
              <>
                <Header />
                <main>
                  <ForgotPasswordPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/ui-showcase" element={
              <>
                <Header />
                <main>
                  <UIShowcasePage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/partner-registration" element={
              <PartnerRegistrationPage />
            } />
            <Route path="/coming-soon" element={
              <ComingSoonPage />
            } />
            <Route path="/maintenance" element={
              <MaintenancePage />
            } />
            <Route path="/map" element={
              <>
                <Header />
                <main>
                  <MapPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/wallet" element={
              <>
                <Header />
                <main>
                  <ProtectedRoute>
                    <WalletPage />
                  </ProtectedRoute>
                </main>
                <Footer />
              </>
            } />
            
            {/* Dynamic Pages - Catch all route for custom pages */}
            <Route path="/:slug" element={
              <>
                <Header />
                <main>
                  <DynamicPage />
                </main>
                <Footer />
              </>
            } />
          </Routes>
          </div>
          <SpeedInsights />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;