# SmartEnergy Predictor

Sistem prediksi konsumsi listrik rumah tangga berbasis AI lengkap dengan rekomendasi efisiensi energi personal. Dibangun sebagai capstone project **PJK-GM096** (Pijak x IBM SkillsBuild) dengan tema *AI for Business Intelligence and Market Insights*.

> Target: membantu rumah tangga & UKM Indonesia menghemat **20-30%** biaya listrik melalui prediksi konsumsi harian, estimasi tagihan, dan rekomendasi yang actionable.

## Tautan Model ML
Sesuai dengan ketentuan Capstone, model XGBoost yang telah dilatih (`xgboost_model.pkl`) dan file penunjang scaler disimpan pada folder `ml/models/`. 
Anda juga dapat mengunduh model tersebut melalui tautan Google Drive berikut (pastikan tim assessor menggunakan akun pijak@student.devacademy.id untuk akses):
**[Tautan Google Drive Model (Masukkan Link GDrive di sini)](#)**

## Tim

| Nama | Peran || Kontribusi | 
|------|-------|
|------|-------|
| Fauzan Aidil Luthfi | Project Manager, Full Stack Developer, Data Analyst | Memimpin proyek dan mengoordinasikan pengembangan sistem. Bertanggung jawab dalam pencarian dan pengolahan dataset, integrasi database, pengembangan frontend menggunakan React.js, peningkatan antarmuka pengguna, integrasi backend dengan database, serta penyempurnaan fitur aplikasi hingga tahap final.
| Vincent Christian | Frontend Developer, System Integration Support |
| Mochamad Abdul Rozag | Backend Developer, Deployment Engineer, DevOps Support |
| Muhammad Najwan Naufal Alfarid | Machine Learning Engineer, Backend Developer, UI/UX Designer |

## Fitur Utama

1. **Prediksi Konsumsi** – Prediksi konsumsi listrik harian (kWh) menggunakan XGBoost dengan target R² ≥ 0.85.
2. **Estimasi Biaya** – Konversi otomatis ke Rupiah dengan tarif PLN R-1/1300 VA (Rp 1.444,70/kWh) yang configurable.
3. **Rekomendasi Personal** – Rule-based engine menghasilkan saran hemat energi yang actionable dalam Bahasa Indonesia.
4. **Dashboard Visual** – Tren konsumsi, breakdown perangkat, peak vs off-peak, dan penghematan potensial.
5. **Autentikasi** – Register/login dengan JWT token, riwayat prediksi per user.

## Tech Stack

- **Machine Learning**: XGBoost (main), scikit-learn (Random Forest, Linear Regression sebagai baseline), pandas, NumPy, matplotlib, seaborn
- **Backend**: FastAPI, Uvicorn, Pydantic, SQLAlchemy (SQLite), python-jose (JWT)
- **Frontend**: React 19, Vite, Tailwind CSS 4, Recharts, Framer Motion, Lucide React
- **Serialization**: joblib (`.pkl`)
- **Testing**: pytest, httpx

## Struktur Project

```
smartenergy-predictor/
├── data/                # Dataset (raw + processed)
├── notebooks/           # Jupyter notebooks (EDA, training, evaluasi)
├── ml/                  # Modul ML (preprocessing, train, predict, recommendation)
├── backend/             # FastAPI app (routes, services, auth)
├── frontend-react/      # React + Vite + Tailwind frontend
├── tests/               # Unit & integration tests
├── docs/                # Dokumentasi tambahan
└── requirements.txt
```

## Instalasi

```bash
# Clone & masuk folder
git clone <repo-url>
cd smartenergy-predictor

# Buat virtual environment (opsional tapi sangat disarankan)
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Salin file environment
cp .env.example .env
```

## Quick Start / Cara Menjalankan Aplikasi

Berikut adalah instruksi jelas tentang cara menjalankan aplikasi:

```bash
# 1. Jalankan backend FastAPI
cd backend
uvicorn main:app --reload --port 8000
# Backend berjalan di http://localhost:8000

# 2. Buka dokumentasi API (Opsional)
# http://localhost:8000/docs

# 3. Jalankan frontend React (buka terminal terpisah di root folder)
cd frontend-react
npm install
npm run dev
# Buka URL yang tertera di terminal (biasanya http://localhost:5173 atau 5175)
```

## API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | — | Registrasi user baru |
| POST | `/api/auth/login` | — | Login, dapatkan JWT token |
| GET | `/api/auth/me` | ✅ | Info user yang login |
| GET | `/api/health` | — | Status check |
| GET | `/api/model-info` | — | Metadata model |
| POST | `/api/predict` | ✅ | Prediksi kWh + biaya |
| POST | `/api/recommend` | ✅ | Generate rekomendasi |
| POST | `/api/predict-with-recommendations` | ✅ | Prediksi + rekomendasi (one-shot) |
| GET | `/api/history` | ✅ | Riwayat prediksi (paginated) |

Detail lengkap di [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).

## Performa Model

Detail lengkap di [`docs/MODEL_CARD.md`](docs/MODEL_CARD.md). Hasil training (default config) pada test holdout 20%:

| Model | MAE (kWh) | RMSE (kWh) | R² | MAPE (%) |
|-------|-----------|------------|-----|----------|
| **XGBoost (main)** | **0.90** | **1.16** | **0.90** | **4.99** |
| Random Forest | 0.94 | 1.21 | 0.89 | 5.22 |
| Linear Regression | 1.21 | 1.61 | 0.80 | 6.71 |

Target **R² ≥ 0.85** tercapai oleh XGBoost. Nilai exact (yang ditampilkan API) berasal dari `ml/models/training_report.json` setelah `python ml/train.py`.

## Testing

```bash
pytest                              # 34 tests
pytest --cov=ml --cov=backend       # Dengan coverage (~75% total)
```

## Dokumentasi

- [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) — Detail tiap endpoint + contoh
- [`docs/MODEL_CARD.md`](docs/MODEL_CARD.md) — Dataset, fitur, performa, batasan
- [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) — Panduan langkah-demi-langkah

## Lisensi

Project edukasi untuk capstone Pijak x IBM SkillsBuild. Tidak untuk komersial tanpa izin tim.
