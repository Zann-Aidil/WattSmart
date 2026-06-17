# API Documentation — SmartEnergy Predictor

Versi: **1.0.0**
Base URL (default lokal): `http://localhost:8000`

> Swagger interaktif: `GET /docs` · ReDoc: `GET /redoc` · OpenAPI JSON: `/openapi.json`

Semua endpoint produktif berada di bawah prefix `/api`.

## Autentikasi & CORS

Endpoint terbuka tanpa autentikasi (default deployment lokal). CORS dibatasi
oleh variabel lingkungan `CORS_ORIGINS` (lihat `.env.example`).

## Endpoint List

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET    | `/api/health` | Status check + apakah model termuat |
| GET    | `/api/model-info` | Metadata + metrik model |
| POST   | `/api/predict` | Prediksi kWh + estimasi biaya |
| POST   | `/api/recommend` | Rekomendasi efisiensi (prediksi opsional) |
| POST   | `/api/predict-with-recommendations` | Prediksi + rekomendasi (one-shot) |

---

## `GET /api/health`

Liveness probe.

### Response 200

```json
{
  "status": "ok",
  "app": "SmartEnergy Predictor",
  "version": "1.0.0",
  "model_loaded": true
}
```

`status` bernilai `degraded` jika file model belum tersedia (training belum dijalankan).

---

## `GET /api/model-info`

Metadata model + metrik akurasi.

### Response 200

```json
{
  "app": "SmartEnergy Predictor",
  "version": "1.0.0",
  "model_name": "XGBoost",
  "trained_at": "2026-05-11T12:30:33.903405+00:00",
  "feature_count": 16,
  "feature_names": ["jam", "suhu_celsius", "..."],
  "metrics": { "mae": 0.9018, "rmse": 1.1611, "r2": 0.8971, "mape": 4.99 },
  "target_met": true
}
```

---

## `POST /api/predict`

Memprediksi konsumsi listrik harian (kWh) dan estimasi biaya Rupiah.

### Request body

| Field | Tipe | Wajib | Range / Default | Keterangan |
|-------|------|-------|------------------|------------|
| `tanggal` | `date` (YYYY-MM-DD) | ya | — | Tanggal target prediksi |
| `jam` | `int` | tidak | 0-23, default 19 | Jam representatif (default jam beban puncak) |
| `suhu_celsius` | `float` | ya | 10-45 | Suhu lingkungan |
| `hari_libur` | `int` | tidak | 0 / 1, default 0 | 1 jika hari libur nasional |
| `jumlah_penghuni` | `int` | ya | 1-20 | |
| `jumlah_perangkat_aktif` | `int` | ya | 0-50 | Estimasi perangkat listrik aktif |
| `jam_penggunaan_rata_rata` | `float` | ya | 0-24 | Rata-rata jam pemakaian per hari |
| `konsumsi_7_hari_terakhir` | `list[float]` | tidak | 0-200 / item, default `[]` | Urut lama → baru |

### Contoh request

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2025-05-12",
    "jam": 19,
    "suhu_celsius": 31.0,
    "hari_libur": 0,
    "jumlah_penghuni": 4,
    "jumlah_perangkat_aktif": 10,
    "jam_penggunaan_rata_rata": 9.0,
    "konsumsi_7_hari_terakhir": [18.2, 17.9, 19.1, 21.0, 18.5, 19.4, 20.0]
  }'
```

### Response 200

```json
{
  "tanggal": "2025-05-12",
  "prediksi_kwh": 22.416,
  "estimasi_biaya_rp": 32384.4,
  "estimasi_biaya_rp_formatted": "Rp 32.384",
  "kategori_konsumsi": "tinggi",
  "tarif_per_kwh": 1444.7,
  "rata_rata_historis_kwh": 19.157
}
```

`kategori_konsumsi` adalah salah satu dari: `rendah` (<10 kWh), `sedang` (<20), `tinggi` (<30), `sangat_tinggi` (≥30).

### Error 422

Jika body tidak valid (mis. `suhu_celsius` di luar 10-45).

### Error 503

Jika model belum di-training (`ml/models/xgboost_model.pkl` tidak ada).

---

## `POST /api/recommend`

Menghasilkan rekomendasi efisiensi. Body identik dengan `/api/predict`, plus
satu field opsional `prediksi_kwh` (jika sudah punya prediksi sendiri).

### Request body tambahan

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `prediksi_kwh` | `float` | tidak | Jika kosong, model akan dijalankan otomatis |

### Response 200

```json
{
  "rekomendasi": [
    {
      "judul": "Atur suhu AC ke 24-25°C, bukan di bawah 22°C",
      "deskripsi": "Suhu lingkungan 32.0°C ...",
      "estimasi_hemat_kwh": 1.17,
      "estimasi_hemat_rp": 1690.3,
      "estimasi_hemat_rp_formatted": "Rp 1.690",
      "prioritas": "high",
      "kategori": "iklim"
    }
  ],
  "total_estimasi_hemat_kwh": 9.4,
  "total_estimasi_hemat_rp": 13580.18,
  "total_estimasi_hemat_rp_formatted": "Rp 13.580"
}
```

Nilai `prioritas`: `low` / `medium` / `high`.
Nilai `kategori`: `perangkat` / `perilaku` / `iklim` / `waktu` / `umum`.

---

## `POST /api/predict-with-recommendations`

Endpoint kombinasi - menjalankan prediksi sekaligus rekomendasi dalam satu request.

### Body

Sama persis dengan `/api/predict`.

### Response 200

```json
{
  "prediksi": { ... },        // sama dengan response /api/predict
  "rekomendasi": { ... }      // sama dengan response /api/recommend
}
```

---

## Error envelope

Untuk error yang dilemparkan oleh handler eksplisit:

```json
{ "error": "ValidationError", "detail": "..." }
```

Error validasi Pydantic mengikuti format default FastAPI (`detail` berupa array).
