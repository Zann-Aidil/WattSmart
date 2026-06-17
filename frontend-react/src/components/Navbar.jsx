import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Bell } from 'lucide-react';
import Logo from './Logo';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ toggleDarkMode, isDarkMode }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const navItems = isLandingPage 
    ? [
        { name: 'Beranda', path: '/' },
        { name: 'Prediksi', path: '/predict' },
        { name: 'Hasil', path: '/analysis' },
        { name: 'Rekomendasi', path: '/predict' },
        { name: 'Fitur', path: '#fitur' },
        { name: 'Tentang Kami', path: '/tentang' },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Prediksi', path: '/predict' },
        { name: 'Analisis', path: '/analysis' },
        { name: 'Tentang Kami', path: '/tentang' },
      ];

  const { user } = useContext(AuthContext);

  // In landing page "Beranda" is active, else check paths
  const checkActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path) && path !== '#' || (location.pathname === '/' && path === '/');
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 flex items-center justify-between px-6 py-3 sticky top-0 z-50" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
      {/* Left - Logo */}
      <Link to="/" className="min-w-[240px] hover:opacity-90 transition-opacity">
        <Logo />
      </Link>
      
      {/* Center - Links */}
      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item, idx) => {
          const isActive = checkActive(item.path);
          return (
            <Link 
              key={idx} 
              to={item.path}
              className={`text-sm font-medium transition-all duration-200 border-b-2 py-7 ${isActive ? 'text-emerald-600 border-emerald-500' : 'text-gray-600 border-transparent hover:text-emerald-600'}`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleDarkMode} 
          className="p-2 rounded-full border border-gray-200 text-muted hover:bg-gray-50 transition-colors"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <Moon size={18} />
        </button>

        {!user ? (
          <>
            <Link to="/login" className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all duration-200 ml-2 hidden sm:flex">
              Masuk
            </Link>
            <Link to="/predict" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 hidden sm:flex">
              Mulai Prediksi
            </Link>
          </>
        ) : (
          <>
            <button className="p-2 relative text-muted hover:text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <Link to="/pengaturan" className="flex items-center gap-3 ml-2 pl-4 border-l cursor-pointer hover:opacity-80" style={{ borderColor: 'var(--border-color)' }}>
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold uppercase overflow-hidden">
                {user.username?.[0] || 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-bold text-primary leading-tight">{user.username}</span>
                <span className="text-xs text-muted leading-tight">Pengguna Aktif</span>
              </div>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
