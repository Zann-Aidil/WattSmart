import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, BarChart2, Lightbulb, History, Info, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
    { name: 'Prediksi', path: '/predict', icon: <Zap size={18} /> },
    { name: 'Analisis', path: '/analysis', icon: <BarChart2 size={18} /> },
    { name: 'Riwayat', path: '/riwayat', icon: <History size={18} /> },
    { name: 'Tentang Kami', path: '/tentang', icon: <Info size={18} /> },
    { name: 'Pengaturan', path: '/pengaturan', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 min-h-screen bg-white border-r border-gray-100 p-4 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)' }}>
      <div className="flex flex-col gap-1 mt-4">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname.startsWith(item.path) && item.path !== '#';
          
          return (
            <Link 
              key={idx}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? 'bg-emerald-50 text-emerald' 
                  : 'text-muted hover:bg-gray-50 hover:text-primary'
              }`}
              style={isActive ? { backgroundColor: 'var(--accent-primary-light)', color: 'var(--accent-primary-hover)' } : {}}
            >
              <div className={`${isActive ? 'text-emerald' : 'text-muted'}`}>
                {item.icon}
              </div>
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-8 mb-4">
        <div className="card bg-emerald-50 border-emerald-100 p-4 rounded-xl relative overflow-hidden" style={{ backgroundColor: 'var(--accent-primary-light)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <h4 className="font-bold text-emerald text-sm mb-1" style={{ color: 'var(--accent-primary-hover)' }}>Hemat Energi,<br/>Hemat Biaya</h4>
          <p className="text-xs text-muted mb-2 z-10 relative">Kelola konsumsi listrik rumah Anda dengan lebih cerdas.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
