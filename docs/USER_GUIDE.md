# User Guide — SmartEnergy Predictor

Panduan langkah-demi-langkah untuk menjalankan dan menggunakan SmartEnergy Predictor secara lokal.

## 1. Prasyarat

- Python **3.11+** (tested dengan 3.13).
- Pip & virtual environment (disarankan).
- Browser modern (Chrome, Edge, Firefox).

## 2. Setup

```bash
# 1) Clone & masuk folder
git clone <repo-url>
cd smartenergy-predictor

# 2) Buat virtual environment
python -m venv venv

# Windows (PowerShell)
venv\Scripts\Activate.ps1
# macOS / Linux
source venv/bin/activate

# 3) Install dependencies
pip install -r requirements.txt

# 4) Salin file environment
cp .env.example .env   # macOS / Linux
copy .env.example .env # Windows
```

## 3. Generate Dataset & Train Model

```bash
# Generate dataset sintetis (default 12.000 baris)
python data/synthetic_generator.py

# Train semua model (XGBoost + RF + Linear) - 1-3 menit
python ml/train.py

# Smoke-test inference
python ml/predict.py
```

Hasil training tersimpan di `ml/models/`. Cek `training_report.json` untuk
melihat akurasi (target XGBoost R² ≥ 0.85).

## 4. Jalankan Backend

```bash
uvicorn backend.main:app --reload --port 8000
```

Buka:
- **Swagger UI**: <http://localhost:8000/docs>
- **ReDoc**: <http://localhost:8000/redoc>
- **Health**: <http://localhost:8000/api/health>

## 5. Jalankan Frontend

Di terminal lain (sambil backend tetap jalan):

```bash
python -m http.server 5500 --directory frontend
```

Buka <http://localhost:5500> di browser.

> Alternatif: buka file `frontend/index.html` langsung di browser. Tapi
> beberapa browser memblokir `fetch()` dari `file://` ke `http://localhost` -
> menggunakan static server adalah pilihan paling stabil.

## 6. Cara Menggunakan Aplikasi

### Beranda (`index.html`)

- Pengenalan singkat aplikasi.
- Tombol **"Mulai Prediksi"** menuju halaman prediksi.
- Tombol **"Lihat Dashboard"** menuju visualisasi.

### Halaman Prediksi (`predict.html`)

1. Isi parameter:
   - **Tanggal**: tanggal target prediksi (default: hari ini).
   - **Jam**: jam representatif (0-23). Untuk pengamatan beban puncak, gunakan 17-22.
   - **Suhu (°C)**: suhu lingkungan rata-rata.
   - **Jumlah penghuni**: orang yang menempati rumah.
   - **Perangkat aktif**: estimasi total perangkat listrik aktif simultan.
   - **Jam pemakaian/hari**: rata-rata jam pemakaian listrik harian (mis. 8 jam).
   - **Hari libur** (checkbox): centang jika hari libur nasional.
2. Isi **konsumsi 7 hari terakhir** (kWh). Boleh kosong, tapi memberi nilai
   meningkatkan akurasi prediksi karena model akan menggunakan fitur lag/rolling.
3. Klik **"Prediksi Sekarang"**.
4. Tunggu 1-2 detik. Hasil muncul di kanan:
   - **Prediksi kWh** dengan kategori (Rendah / Sedang / Tinggi / Sangat Tinggi).
   - **Estimasi biaya** dalam Rupiah.
   - **Daftar rekomendasi** prioritised - prioritas `high` (merah) ditampilkan dulu.
5. Total potensi penghematan harian tampil di atas list rekomendasi.

### Halaman Dashboard (`dashboard.html`)

- **Stat cards**: konsumsi 30 hari, estimasi tagihan, rata-rata harian, potensi hemat.
- **Tren konsumsi**: garis hijau solid (historis 30 hari) + dashed (prediksi 7 hari ke depan, dihitung dari API).
- **Breakdown perangkat**: estimasi pembagian konsumsi per kategori (AC, lampu, kulkas, dll).
- **Peak vs Off-Peak**: distribusi konsumsi pada jam beban puncak PLN (17.00-22.00).

> Catatan: data historis di dashboard adalah sample lokal yang di-generate di
> browser. Setelah aplikasi terhubung ke meteran/IoT riil, ganti `SAMPLE_HISTORY`
> di `frontend/js/dashboard.js` dengan data sebenarnya.

## 7. Mengubah Tarif PLN

Edit `.env` dan ubah:

```bash
TARIFF_PER_KWH=1444.70
```

Restart `uvicorn` agar perubahan terbaca.

Referensi tarif PLN per Mei 2026 (subsidi & non-subsidi sering berubah - cek
tarif resmi PLN):

| Golongan | Daya | Rp/kWh |
|----------|------|--------|
| R-1 (subsidi) | 450 VA | 415 |
| R-1 (subsidi) | 900 VA | 605 |
| R-1 | 1300 VA | 1444,70 |
| R-1 | 2200 VA | 1444,70 |
| R-2 | 3500-5500 VA | 1699,53 |
| R-3 | ≥6600 VA | 1699,53 |

## 8. Testing

```bash
pytest                          # Semua test
pytest tests/test_api.py -v     # Hanya API
pytest --cov=ml --cov=backend   # Dengan coverage
```

## 9. Troubleshooting

### "Model belum di-training" / 503

Jalankan dulu `python data/synthetic_generator.py` lalu `python ml/train.py`.

### Frontend "Tidak dapat terhubung ke API"

- Pastikan `uvicorn` berjalan di port 8000.
- Cek browser DevTools Console untuk error CORS.
- Tambahkan origin frontend Anda ke `CORS_ORIGINS` di `.env`.

### Port 8000 sudah dipakai

Ganti port:

```bash
uvicorn backend.main:app --port 8080
```

Lalu ubah `window.SE_API_BASE = 'http://localhost:8080/api'` sebelum
include `js/api.js` di HTML (mis. dalam tag `<script>` inline di `<head>`).

### Notebook tidak menemukan dataset

Pastikan working directory adalah root project, atau jalankan:

```bash
jupyter notebook --notebook-dir=.
```

dari folder `smartenergy-predictor/`.

## 10. Selanjutnya

- Re-train dengan data riil setelah mengumpulkan minimal 90 hari log konsumsi.
- Integrasikan dengan smart meter / IoT (mis. Sonoff, Shelly) untuk data otomatis.
- Tambahkan database (SQLite/Postgres) untuk menyimpan riwayat prediksi pengguna.
- Deploy backend ke Cloud (Heroku, Railway, IBM Cloud) dan host frontend di Vercel/Netlify.
