import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Lazy loaded routes for fast initial page load (Code Splitting)
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const CheckEmail = lazy(() => import('./pages/CheckEmail'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const FreelancerDashboard = lazy(() => import('./pages/FreelancerDashboard'));
const FreelancerSetupWizard = lazy(() => import('./pages/FreelancerSetupWizard'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const GigDetail = lazy(() => import('./pages/GigDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
    <div className="w-9 h-9 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
    <span className="mt-3 text-xs font-medium text-slate-400">Loading...</span>
  </div>
);

function App() {
  useEffect(() => {
    AOS.init({
      duration: 550,
      once: true,
      easing: 'ease-out-cubic',
      disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <div className="min-h-screen text-slate-900 flex flex-col selection:bg-indigo-100 overflow-x-hidden">
                <main className="flex-grow">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
                      <Route path="/check-email" element={<CheckEmail />} />
                      <Route path="/verify-email/:token" element={<VerifyEmail />} />
                      <Route path="/dashboard/client" element={<Navigate to="/client/dashboard" replace />} />
                      <Route path="/dashboard/freelancer" element={<Navigate to="/freelancer/dashboard" replace />} />
                      <Route path="/dashboard" element={<Navigate to="/freelancer/dashboard" replace />} />
                      <Route path="/client/dashboard" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
                      <Route path="/freelancer/dashboard" element={<ProtectedRoute role="freelancer"><FreelancerDashboard /></ProtectedRoute>} />
                      <Route path="/freelancer/setup" element={<ProtectedRoute role="freelancer"><FreelancerSetupWizard /></ProtectedRoute>} />
                      <Route path="/profile/:id" element={<PublicProfile />} />
                      <Route path="/profile" element={<PublicProfile />} />
                      <Route path="/profile/me" element={<PublicProfile />} />
                      <Route path="/marketplace" element={<Marketplace />} />
                      <Route path="/gigs" element={<Marketplace />} />
                      <Route path="/gigs/:id" element={<GigDetail />} />
                      <Route path="/jobs" element={<Marketplace />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
