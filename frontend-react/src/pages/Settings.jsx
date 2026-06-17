import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, User, LogOut, Shield, Bell, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateProfile, changePassword, deleteHistory } from '../services/api';

const Settings = () => {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('profil');
  const [email, setEmail] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState(null);
  const [notifToggles, setNotifToggles] = useState(() =>
    JSON.parse(localStorage.getItem('wattsmartNotif') || '{"email":false,"push":false}')
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);

  useEffect(() => {
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.email) setEmail(d.email); })
      .catch(() => {});
  }, [token]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    try {
      await updateProfile({ email });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPw !== pwForm.confirm) { setPwStatus('mismatch'); return; }
    setPwStatus('saving');
    try {
      await changePassword({ current_password: pwForm.current, new_password: pwForm.newPw });
      setPwStatus('success');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPwForm({ current: '', newPw: '', confirm: '' });
        setPwStatus(null);
      }, 2000);
    } catch {
      setPwStatus('error');
      setTimeout(() => setPwStatus(null), 3000);
    }
  };

  const handleToggleNotif = (key) => {
    const updated = { ...notifToggles, [key]: !notifToggles[key] };
    setNotifToggles(updated);
    localStorage.setItem('wattsmartNotif', JSON.stringify(updated));
  };

  const handleDeleteHistory = async () => {
    setDeleteStatus('deleting');
    try {
      await deleteHistory();
      setDeleteStatus('success');
      setShowDeleteConfirm(false);
      setTimeout(() => setDeleteStatus(null), 3000);
    } catch {
      setDeleteStatus('error');
      setTimeout(() => setDeleteStatus(null), 3000);
    }
  };

  const menuItems = [
    { key: 'profil', label: 'Profil & Akun' },
    { key: 'notifikasi', label: 'Notifikasi' },
    { key: 'privasi', label: 'Privasi & Keamanan' },
  ];

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
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`p-4 rounded-xl text-left font-medium transition-colors ${
                activeSection === item.key
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          {activeSection === 'profil' && (
            <>
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
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Tambahkan email..."
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-3">
                  {saveStatus === 'success' && <span className="text-sm text-emerald-600">Tersimpan!</span>}
                  {saveStatus === 'error' && <span className="text-sm text-red-500">Gagal menyimpan.</span>}
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                    disabled={saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-amber-500" /> Keamanan Akun
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Jaga keamanan akun Anda dengan memperbarui kata sandi secara berkala.
                </p>
                <button
                  className="btn btn-outline-gray w-full sm:w-auto"
                  onClick={() => setShowPasswordModal(v => !v)}
                >
                  Ubah Kata Sandi
                </button>
                {showPasswordModal && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-3">
                    <h4 className="font-semibold text-sm text-gray-900">Ubah Kata Sandi</h4>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password saat ini"
                      value={pwForm.current}
                      onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                    />
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password baru"
                      value={pwForm.newPw}
                      onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                    />
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Konfirmasi password baru"
                      value={pwForm.confirm}
                      onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                    />
                    {pwStatus === 'mismatch' && <p className="text-sm text-red-500">Password baru tidak cocok.</p>}
                    {pwStatus === 'error' && <p className="text-sm text-red-500">Password saat ini salah.</p>}
                    {pwStatus === 'success' && <p className="text-sm text-emerald-600">Password berhasil diubah!</p>}
                    <div className="flex gap-2">
                      <button
                        className="btn btn-primary flex-1"
                        onClick={handleChangePassword}
                        disabled={pwStatus === 'saving'}
                      >
                        {pwStatus === 'saving' ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button
                        className="btn btn-outline-gray flex-1"
                        onClick={() => {
                          setShowPasswordModal(false);
                          setPwForm({ current: '', newPw: '', confirm: '' });
                          setPwStatus(null);
                        }}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="card border-red-100 bg-red-50/30">
                <h3 className="font-bold text-lg text-red-600 mb-2 flex items-center gap-2">
                  <LogOut size={18} /> Keluar Aplikasi
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Anda akan keluar dari sesi saat ini. Riwayat Anda tetap tersimpan dengan aman.
                </p>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Keluar Sekarang
                </button>
              </div>
            </>
          )}

          {activeSection === 'notifikasi' && (
            <div className="card">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Bell size={18} className="text-blue-500" /> Preferensi Notifikasi
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { key: 'email', label: 'Notifikasi Email', desc: 'Terima ringkasan prediksi melalui email.' },
                  { key: 'push', label: 'Notifikasi Push', desc: 'Aktifkan notifikasi browser untuk pengingat.' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggleNotif(item.key)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notifToggles[item.key] ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifToggles[item.key] ? 'left-6' : 'left-1'}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'privasi' && (
            <div className="card">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Lock size={18} className="text-purple-500" /> Privasi & Keamanan
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Data prediksi Anda disimpan secara aman di server kami dan hanya dapat diakses oleh akun Anda.
                Kami tidak membagikan data pribadi Anda kepada pihak ketiga.
              </p>
              <div className="p-4 border border-red-100 rounded-xl bg-red-50/50">
                <h4 className="font-semibold text-red-600 text-sm mb-1">Hapus Riwayat Prediksi</h4>
                <p className="text-xs text-gray-500 mb-3">
                  Menghapus semua riwayat prediksi Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Hapus Riwayat
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-red-600">Yakin? Tindakan ini tidak bisa dibatalkan.</p>
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                        onClick={handleDeleteHistory}
                        disabled={deleteStatus === 'deleting'}
                      >
                        {deleteStatus === 'deleting' ? 'Menghapus...' : 'Ya, Hapus'}
                      </button>
                      <button
                        className="px-4 py-2 text-sm border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
                {deleteStatus === 'success' && <p className="text-sm text-emerald-600 mt-2">Riwayat berhasil dihapus.</p>}
                {deleteStatus === 'error' && <p className="text-sm text-red-500 mt-2">Gagal menghapus riwayat.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
