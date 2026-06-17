import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import Settings from './pages/Settings';
import About from './pages/About';
import Footer from './components/Footer';
import { AuthProvider, AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppLayout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Navbar spans full width */}
      <Navbar toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      
      {isLandingPage || location.pathname === '/login' || location.pathname === '/register' ? (
        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      ) : (
        <div className="flex flex-grow max-w-[1440px] mx-auto w-full">
          {/* Sidebar on the left */}
          <div className="hidden md:block">
            <Sidebar />
          </div>
          
          {/* Main content area */}
          <main className="flex-grow p-6 md:p-8 bg-app overflow-y-auto" style={{ backgroundColor: 'var(--bg-app)' }}>
            <Routes>
              <Route path="/predict" element={<ProtectedRoute><Predict /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
              <Route path="/riwayat" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/pengaturan" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/tentang" element={<ProtectedRoute><About /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
