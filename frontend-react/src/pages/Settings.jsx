import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, User, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h2>
          <p className="text-sm text-gray-500">Kelola preferensi dan keamanan akun Anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col gap-2">
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl font-medium border border-emerald-100 cursor-pointer">
            Profil & Akun
          </div>
          <div className="p-4 text-gray-600 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
            Notifikasi
          </div>
          <div className="p-4 text-gray-600 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
            Privasi & Keamanan
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="card">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <User size={18} className="text-emerald-600" /> Informasi Profil
            </h3>
            
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-3xl font-bold uppercase">
                {user?.username?.[0] || 'U'}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">{user?.username}</h4>
                <p className="text-sm text-gray-500">Pengguna Terdaftar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label">Username</label>
                <input type="text" className="form-control bg-gray-50" value={user?.username || ''} disabled />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" placeholder="Tambahkan email..." />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn btn-primary">Simpan Perubahan</button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Shield size={18} className="text-amber-500" /> Keamanan Akun
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Jaga keamanan akun Anda dengan memperbarui kata sandi secara berkala.
            </p>
            <button className="btn btn-outline-gray w-full sm:w-auto">Ubah Kata Sandi</button>
          </div>

          <div className="card border-red-100 bg-red-50/30">
            <h3 className="font-bold text-lg text-red-600 mb-2 flex items-center gap-2">
              <LogOut size={18} /> Keluar Aplikasi
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Anda akan keluar dari sesi saat ini. Riwayat Anda tetap tersimpan dengan aman.
            </p>
            <button onClick={handleLogout} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
              Keluar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
