# Settings Functional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all Settings page UI functional — profile email save, change password, notification toggles, and privacy section with history deletion.

**Architecture:** 3 new backend endpoints (PUT /profile, POST /change-password, DELETE /history) + update GET /me to return email + 3 new api.js functions + full Settings.jsx rework with activeSection state.

**Tech Stack:** FastAPI (Python), SQLAlchemy, bcrypt, React, Tailwind CSS 4, axios.

## Global Constraints

- Backend files live at `backend/routes/auth.py` and `backend/routes/history.py` (NOT `routers/`)
- All new backend endpoints require Bearer token auth via `Depends(get_current_user)`
- Use `Optional[str]` for email (nullable, no uniqueness constraint)
- Notification toggles saved to `localStorage` key `wattsmartNotif` as JSON `{"email": bool, "push": bool}`
- No new npm packages
- `api.js` uses axios; auth token read from `localStorage.getItem('token')` via `getAuthHeaders()`
- Do NOT import `React` at the top of JSX files (project uses new JSX transform — causes lint error)

---

### Task A1: Add email to User model + update GET /me + add PUT /profile

**Files:**
- Modify: `backend/models.py`
- Modify: `backend/routes/auth.py`

**Interfaces:**
- Produces: `User.email` column; `GET /api/auth/me` returns `{username, email, created_at}`; `PUT /api/auth/profile` accepts `{email}` returns `{username, email}`

- [ ] **Step 1: Add `email` column to User model in `backend/models.py`**

Add one line after `hashed_password`:
```python
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from backend.database import Base


def _utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    email = Column(String, nullable=True, default=None)
    created_at = Column(DateTime, default=_utc_now)

    predictions = relationship("PredictionHistory", back_populates="user")
```

- [ ] **Step 2: Update `backend/routes/auth.py` — add email to UserMeResponse + add PUT /profile**

Replace the entire file content:
```python
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.deps import get_db, get_current_user
from backend.models import User
from backend.utils.auth import get_password_hash, verify_password, create_access_token

router = APIRouter()


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str


class UserMeResponse(BaseModel):
    username: str
    email: Optional[str] = None
    created_at: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    email: Optional[str] = None


class UpdateProfileResponse(BaseModel):
    username: str
    email: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ChangePasswordResponse(BaseModel):
    message: str


@router.post("/register", response_model=TokenResponse, summary="Registrasi user baru")
def register_user(user: UserCreate, db: Session = Depends(get_db)) -> TokenResponse:
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.username})
    return TokenResponse(access_token=access_token, token_type="bearer", username=new_user.username)


@router.post("/login", response_model=TokenResponse, summary="Login dan dapatkan JWT token")
def login(user: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": db_user.username})
    return TokenResponse(access_token=access_token, token_type="bearer", username=db_user.username)


@router.get("/me", response_model=UserMeResponse, summary="Info user yang sedang login")
def read_users_me(current_user: User = Depends(get_current_user)) -> UserMeResponse:
    return UserMeResponse(
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None,
    )


@router.put("/profile", response_model=UpdateProfileResponse, summary="Update profil user")
def update_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UpdateProfileResponse:
    current_user.email = body.email
    db.commit()
    db.refresh(current_user)
    return UpdateProfileResponse(username=current_user.username, email=current_user.email)


@router.post("/change-password", response_model=ChangePasswordResponse, summary="Ubah kata sandi")
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChangePasswordResponse:
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Password saat ini salah")
    current_user.hashed_password = get_password_hash(body.new_password)
    db.commit()
    return ChangePasswordResponse(message="Password berhasil diubah")
```

- [ ] **Step 3: Restart backend and verify GET /me returns email field**

With backend running (`uvicorn main:app --reload --port 8000`), login and call:
```
GET http://localhost:8000/api/auth/me
Authorization: Bearer <token>
```
Expected response:
```json
{"username": "testuser", "email": null, "created_at": "..."}
```

- [ ] **Step 4: Verify PUT /profile works**

```
PUT http://localhost:8000/api/auth/profile
Authorization: Bearer <token>
{"email": "test@example.com"}
```
Expected: `{"username": "testuser", "email": "test@example.com"}`

- [ ] **Step 5: Commit**

```bash
git add backend/models.py backend/routes/auth.py
git commit -m "feat: add email to user model, update /me, add PUT /profile and POST /change-password"
```

---

### Task A2: Add DELETE /history endpoint

**Files:**
- Modify: `backend/routes/history.py`

**Interfaces:**
- Consumes: `get_current_user`, `PredictionHistory` model
- Produces: `DELETE /api/history` → `{"message": "...", "deleted_count": N}`

- [ ] **Step 1: Add DELETE endpoint to `backend/routes/history.py`**

Append to the end of the file (after the existing `get_user_history` function):
```python
class DeleteHistoryResponse(BaseModel):
    message: str
    deleted_count: int


@router.delete("/history", response_model=DeleteHistoryResponse, summary="Hapus semua riwayat prediksi")
def delete_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DeleteHistoryResponse:
    count = db.query(PredictionHistory).filter(
        PredictionHistory.user_id == current_user.id
    ).count()
    db.query(PredictionHistory).filter(
        PredictionHistory.user_id == current_user.id
    ).delete()
    db.commit()
    return DeleteHistoryResponse(message="Riwayat berhasil dihapus", deleted_count=count)
```

- [ ] **Step 2: Verify DELETE /history works**

With backend running, send:
```
DELETE http://localhost:8000/api/history
Authorization: Bearer <token>
```
Expected: `{"message": "Riwayat berhasil dihapus", "deleted_count": N}`

- [ ] **Step 3: Commit**

```bash
git add backend/routes/history.py
git commit -m "feat: add DELETE /history endpoint"
```

---

### Task A3: Add api.js helper functions

**Files:**
- Modify: `frontend-react/src/services/api.js`

**Interfaces:**
- Produces: `updateProfile(data)`, `changePassword(data)`, `deleteHistory()` — all return axios promises

- [ ] **Step 1: Replace `frontend-react/src/services/api.js` with updated version**

```js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const predictConsumption = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/predict-with-recommendations`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error in prediction:', error);
    throw error;
  }
};

export const getDashboardData = async () => {
  try {
    const response = await axios.get(`${API_URL}/history`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await axios.put(`${API_URL}/auth/profile`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const changePassword = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/auth/change-password`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const deleteHistory = async () => {
  try {
    const response = await axios.delete(`${API_URL}/history`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting history:', error);
    throw error;
  }
};
```

- [ ] **Step 2: Verify lint clean**

```bash
cd frontend-react && npx eslint src/services/api.js
```
Expected: no output (no errors)

- [ ] **Step 3: Commit**

```bash
git add frontend-react/src/services/api.js
git commit -m "feat: add updateProfile, changePassword, deleteHistory to api.js"
```

---

### Task A4: Rework Settings.jsx with full interactivity

**Files:**
- Modify: `frontend-react/src/pages/Settings.jsx`

**Interfaces:**
- Consumes: `updateProfile`, `changePassword`, `deleteHistory` from `../services/api`
- Consumes: `token`, `user`, `logout` from `AuthContext`
- Consumes: `GET /api/auth/me` directly via fetch to load saved email

- [ ] **Step 1: Replace `frontend-react/src/pages/Settings.jsx` entirely**

```jsx
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
```

- [ ] **Step 2: Verify lint clean**

```bash
cd frontend-react && npx eslint src/pages/Settings.jsx
```
Expected: no output

- [ ] **Step 3: Verify all sections work in browser**

With both backend (port 8000) and frontend (`npm run dev`) running, navigate to `/pengaturan`:
- Click "Notifikasi" menu → should show toggle switches
- Click "Privasi & Keamanan" → should show privacy text + delete button
- On "Profil & Akun": enter email, click "Simpan Perubahan" → should show "Tersimpan!"
- Click "Ubah Kata Sandi" → form should expand; entering wrong current password shows error
- "Hapus Riwayat" → shows confirmation; clicking "Batal" dismisses it

- [ ] **Step 4: Commit**

```bash
git add frontend-react/src/pages/Settings.jsx
git commit -m "feat: make Settings page fully functional - profile, password, notifications, privacy"
```
