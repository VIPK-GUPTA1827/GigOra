import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Signup from './pages/Signup';
import Login from './pages/Login';
import CheckEmail from './pages/CheckEmail';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import FreelancerSetupWizard from './pages/FreelancerSetupWizard';
import PublicProfile from './pages/PublicProfile';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

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
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen text-slate-900 flex flex-col selection:bg-indigo-100">
            <main className="flex-grow">
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
                <Route path="/client/dashboard" element={<ClientDashboard />} />
                <Route path="/client-dashboard" element={<ClientDashboard />} />
                <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
                <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
                <Route path="/freelancer/setup" element={<FreelancerSetupWizard />} />
                <Route path="/profile/:id" element={<PublicProfile />} />
                <Route path="/profile" element={<PublicProfile />} />
                <Route path="/profile/me" element={<PublicProfile />} />
                <Route path="/marketplace" element={<Home />} />
                <Route path="/gigs" element={<Home />} />
                <Route path="/jobs" element={<Home />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

