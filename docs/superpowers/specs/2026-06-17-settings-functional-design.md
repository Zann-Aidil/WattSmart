# Settings Page — Functional Features Design Spec
**Date:** 2026-06-17

## Summary

Make all Settings page UI functional. Currently the page renders but buttons/fields do nothing. This spec covers: profile email update, change password modal, notification toggles, privacy section with history deletion.

## Scope

- `frontend-react/src/pages/Settings.jsx` — full rework of interactivity
- `frontend-react/src/services/api.js` — add 3 new API call functions
- `backend/models.py` — add `email` field (nullable) to `User` model
- `backend/schemas.py` — add request/response schemas for new endpoints
- `backend/routers/auth.py` — add `PUT /api/auth/profile` and `POST /api/auth/change-password`
- `backend/routers/history.py` — add `DELETE /api/history`

## Backend Changes

### 1. Database — User model
Add nullable `email` column to `users` table:
```python
email: Mapped[Optional[str]] = mapped_column(String, nullable=True, default=None)
```
Use SQLAlchemy `create_all()` (already called at startup) — this adds the column on next startup for SQLite.

### 2. New Schemas (schemas.py)
```python
class UpdateProfileRequest(BaseModel):
    email: Optional[str] = None

class UpdateProfileResponse(BaseModel):
    username: str
    email: Optional[str]

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ChangePasswordResponse(BaseModel):
    message: str
```

### 3. PUT /api/auth/profile
- Auth: required (Bearer token)
- Input: `UpdateProfileRequest` (email)
- Logic: update `user.email` in DB
- Output: `UpdateProfileResponse`
- Error: 400 if email already taken by another user (skip uniqueness for now — nullable, no unique constraint)

### 4. POST /api/auth/change-password
- Auth: required (Bearer token)
- Input: `ChangePasswordRequest` (current_password, new_password)
- Logic: verify current password with bcrypt, hash new password, update DB
- Output: `ChangePasswordResponse { message: "Password berhasil diubah" }`
- Error: 400 if current_password wrong

### 5. DELETE /api/history
- Auth: required (Bearer token)
- Logic: delete all `PredictionHistory` rows where `user_id == current_user.id`
- Output: `{ "message": "Riwayat berhasil dihapus", "deleted_count": N }`

## Frontend Changes

### Settings.jsx — State

```js
const [activeSection, setActiveSection] = useState('profil')
const [email, setEmail] = useState('')          // populated from GET /api/auth/me
const [saveStatus, setSaveStatus] = useState(null)  // null | 'saving' | 'success' | 'error'
const [showPasswordModal, setShowPasswordModal] = useState(false)
const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
const [pwStatus, setPwStatus] = useState(null)  // null | 'saving' | 'success' | 'error'
const [notifToggles, setNotifToggles] = useState(() => {
  return JSON.parse(localStorage.getItem('wattsmartNotif') || '{"email":false,"push":false}')
})
```

### Profil Section
- Email `<input>` controlled with `value={email}` and `onChange`
- "Simpan Perubahan" calls `updateProfile({ email })`, shows loading/success/error feedback inline
- On mount: fetch `/api/auth/me` to populate username (already done) and email if returned

### Ubah Kata Sandi
- Inline modal (absolute positioned card or simple conditional render below button)
- Fields: "Password Saat Ini", "Password Baru", "Konfirmasi Password Baru"
- Validation: newPw === confirm before submitting
- Calls `changePassword({ current_password, new_password })`
- Success: close modal, show toast/inline success
- Error: show message inline

### Notifikasi Section (activeSection === 'notifikasi')
```
Notifikasi Email    [toggle]
Notifikasi Push     [toggle]
```
- Toggles use `<button>` acting as switch (styled with emerald when on)
- Changes persist to `localStorage` on every toggle
- No backend — localStorage only

### Privasi & Keamanan Section (activeSection === 'privasi')
```
[Static text about data usage]

[Hapus Riwayat Prediksi]  — merah, requires confirmation
```
- Clicking "Hapus Riwayat" shows inline confirmation: "Yakin? Ini tidak bisa dibatalkan." + [Ya, Hapus] [Batal]
- Calls `DELETE /api/history`
- Success: show "Riwayat berhasil dihapus"

### api.js additions
```js
export const updateProfile = (data) =>
  api.put('/auth/profile', data)

export const changePassword = (data) =>
  api.post('/auth/change-password', data)

export const deleteHistory = () =>
  api.delete('/history')
```

## Out of Scope
- Email uniqueness validation
- Email verification (sending actual email)
- Profile photo upload
- Account deletion
