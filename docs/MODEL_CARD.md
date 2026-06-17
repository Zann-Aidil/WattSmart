# Model Card — SmartEnergy Predictor

| Field | Nilai |
|-------|-------|
| Nama model | SmartEnergy Predictor v1.0.0 |
| Algoritma utama | XGBoost (`xgboost.XGBRegressor`) |
| Algoritma pembanding | Random Forest, Linear Regression |
| Target | `konsumsi_kwh` — konsumsi listrik harian (kWh) |
| Domain | Rumah tangga & UKM di Indonesia |
| Bahasa antarmuka | Bahasa Indonesia |

## Tujuan

Memprediksi konsumsi listrik harian rumah tangga sehingga pengguna dapat
- mengetahui estimasi tagihan listrik (Rupiah) sebelum akhir bulan;
- menerima rekomendasi efisiensi yang prioritised;
- menargetkan penghematan 20-30% dari konsumsi normal.

## Dataset

Project ini secara default menggunakan **dataset sintetis** yang dihasilkan oleh
`data/synthetic_generator.py`. Dataset asli yang menjadi referensi adalah UCI
*Individual Household Electric Power Consumption*. Dataset sintetis dibuat
karena:

1. Konsistensi reproducibility (seed-controlled).
2. Cocok dengan iklim tropis Indonesia (22-36°C, hari libur PLN).
3. Ukuran < 5 MB sehingga ringan disertakan dalam repo.

### Schema

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `tanggal` | date | Tanggal observasi |
| `jam` | int (0-23) | Jam representatif |
| `suhu_celsius` | float | Suhu lingkungan |
| `hari_libur` | int (0/1) | 1 jika hari libur nasional |
| `jumlah_penghuni` | int | Jumlah orang di rumah |
| `jumlah_perangkat_aktif` | int | Estimasi perangkat aktif |
| `jam_penggunaan_rata_rata` | float | Rata-rata jam pemakaian listrik/hari |
| `konsumsi_kwh` | float | **Target**: kWh/hari |

### Volume & pola

- 12.000 baris (default; dapat ditingkatkan via `--rows`).
- Pola harian + mingguan + musiman (Mei lebih panas, Juni-Agustus lebih dingin).
- ~1.5% missing values dan 0.5% outlier ekstrem di file *raw* untuk menguji preprocessing pipeline.

## Preprocessing & Feature Engineering

Pipeline `ml/preprocessing.py`:

1. **Type coercion** (`tanggal` → datetime, kolom numerik → float).
2. **Imputasi missing values** dengan median per kolom.
3. **Winsorisasi outlier** (IQR × 3) pada `konsumsi_kwh` & `suhu_celsius`.
4. **Calendar features**: `day_of_week`, `month`, `is_weekend`, `quarter`, `day_of_year`.
5. **Lag features**: `lag_1`, `lag_7`, `roll_mean_7`.
6. **Interaction features**: `temp_x_appliances`, `occupants_x_hours`.
7. **Scaling**: `StandardScaler` pada seluruh fitur numerik.

Pipeline dipersist sebagai `ml/models/scaler.pkl` (`joblib`) sehingga
preprocessing identik saat training maupun inference.

## Hyperparameter Tuning

Dilakukan dengan `RandomizedSearchCV` (25 kombinasi, `n_iter` configurable)
menggunakan `TimeSeriesSplit(n_splits=5)`. Ruang pencarian:

```
n_estimators: [200, 400, 600]
max_depth: [4, 6, 8]
learning_rate: [0.03, 0.05, 0.1]
subsample: [0.8, 1.0]
colsample_bytree: [0.8, 1.0]
min_child_weight: [1, 3]
reg_lambda: [1.0, 2.0]
```

Scoring: `neg_root_mean_squared_error`.

## Metrik Evaluasi

Diukur pada **holdout chronological** (20% data paling baru) untuk menghindari
data leakage temporal.

| Model | MAE (kWh) | RMSE (kWh) | R² | MAPE (%) |
|-------|-----------|------------|-----|----------|
| **XGBoost (main)** | **0.90** | **1.16** | **0.90** | **4.99** |
| Random Forest | 0.94 | 1.21 | 0.89 | 5.22 |
| Linear Regression | 1.21 | 1.61 | 0.80 | 6.71 |

> Nilai exact terbaru dapat dilihat pada `ml/models/training_report.json` setelah
> menjalankan `python ml/train.py`.

**Target R² ≥ 0.85**: tercapai oleh XGBoost & Random Forest. Linear Regression
disajikan sebagai baseline.

## Feature Importance

Lihat `ml/models/feature_importance.png`. Top contributor (urutan tipikal):

1. `jumlah_penghuni`
2. `jam_penggunaan_rata_rata`
3. `roll_mean_7` (rata-rata 7 hari terakhir)
4. `temp_x_appliances`
5. `suhu_celsius`

## Batasan & Risiko

- Model dilatih pada data sintetis - **akurasi pada data riil dapat berbeda**.
  Re-training direkomendasikan setelah mengumpulkan minimal 90 hari data riil.
- Tidak memodelkan event istimewa (gangguan PLN, mati listrik, lonjakan tarif).
- Jam representatif tunggal per hari adalah simplifikasi - data hourly idealnya digunakan.
- Tarif PLN diasumsikan tetap (R-1/1300 VA = Rp 1.444,70/kWh). Tarif aktual untuk daya & golongan lain berbeda.
- Tidak memodelkan PV/solar rooftop atau perangkat dengan inverter variable speed secara eksplisit.

## Penggunaan yang Tidak Direkomendasikan

- Tagihan PLN final - gunakan meteran PLN resmi.
- Audit energi industri (golongan tarif B-2/B-3/I-X tidak dimodelkan).
- Prediksi sub-harian (jam-per-jam).

## Reproducibility

```bash
python data/synthetic_generator.py --rows 12000 --seed 42
python ml/train.py --n-iter 25
```

Artefak yang dihasilkan:
- `ml/models/xgboost_model.pkl`
- `ml/models/scaler.pkl`
- `ml/models/feature_names.json`
- `ml/models/training_report.json`
- `ml/models/feature_importance.png`
- `ml/models/model_comparison.png`

## Maintainer

Tim PJK-GM096:
- Fauzan Aidil Luthfi
- Vincent Christian
- Mochamad Abdul Rozag
- Muhammad Najwan Naufal Alfarid
