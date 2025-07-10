import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import CareerPage from './pages/CareerPage';
import FindRecyclingCentersPage from './pages/FindRecyclingCentersPage';
import LearnPage from './pages/LearnPage';
import { useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import React, { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';


function AppContent() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  
  // Hide navbar for all authenticated users on dashboard routes and registration-pending page
  const shouldHideNavbar = (user && location.pathname.startsWith('/dashboard')) || 
                          location.pathname === '/registration-pending';
  
  // Hide footer for all authenticated users on dashboard routes, registration-pending page, register page, and login page
  const shouldHideFooter = (user && location.pathname.startsWith('/dashboard')) || 
                          location.pathname === '/registration-pending' ||
                          location.pathname === '/register' ||
                          location.pathname.startsWith('/register/') ||
                          location.pathname === '/login';

  return (
      <div className="min-h-screen flex flex-col transition-all duration-500 bg-slate-950">
      {!shouldHideNavbar && <Navbar />}
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/recycling-center" element={<div className="container mx-auto px-4 py-24 text-white">Recycling Center Staff Page</div>} />
            <Route path="/career" element={<CareerPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/find-centers" element={<FindRecyclingCentersPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/collector" element={<RegisterPage />} />
            <Route path="/register/recycling-center" element={<RegisterPage />} />
            <Route path="/registration-pending" element={
              <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500 bg-slate-950">
                <div className="max-w-md w-full text-center">
                  <h2 className="text-4xl font-bold text-emerald-500 mb-4">Registration Pending</h2>
                  <p className="mb-8 transition-all duration-500 text-gray-300">
                    Thank you for registering! Your application is being reviewed by our team.
                    We will notify you by email once your account has been approved.
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200"
                  >
                    Return to Home
                  </a>
                </div>
              </div>
            } />
            <Route path="/dashboard/*" element={<Dashboard />} />
          </Routes>
        </main>
        
      {!shouldHideFooter && <Footer />}
      </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
