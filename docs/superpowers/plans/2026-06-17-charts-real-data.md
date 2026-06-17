# Charts Real Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded/dummy/random chart data across Dashboard, Predict, and Analysis pages with values computed from real `/api/history` data.

**Architecture:** Frontend-only changes. All three pages already fetch from `GET /api/history?limit=200`. Pie charts are replaced with bar charts showing predictions per category. History data fields used: `pred_kwh`, `kategori`, `tanggal`, `jam`, `suhu`, `perangkat_aktif`.

**Tech Stack:** React, Recharts (BarChart, Bar, Cell already available), Tailwind CSS 4.

## Global Constraints

- No backend changes — all data from existing `GET /api/history?limit=200`
- No new npm packages
- Do NOT import `React` at top of files (new JSX transform — causes lint error)
- `token` is available from `useContext(AuthContext)` — use it for any direct fetch calls
- Empty history (0 items): charts show empty state, stats show "—" or "0", no crash
- All history data access via direct `fetch` calls (same pattern as existing Dashboard/Analysis code)

---

### Task B1: Dashboard — replace pie chart with bar chart per kategori

**Files:**
- Modify: `frontend-react/src/pages/Dashboard.jsx`

**Interfaces:**
- Consumes: `/api/history?limit=200` response — `historyData[].kategori`
- Produces: `data.kategoriData` array `[{name, value, fill}]` replacing `data.distribusi`

- [ ] **Step 1: Update `frontend-react/src/pages/Dashboard.jsx`**

Replace the entire file:
```jsx
import { useState, useEffect, useContext } from 'react';
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, DollarSign, Calendar, Activity, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [stats, setStats] = useState({ totalKwh: 0, avgKwh: 0, cost: 0, lastKwh: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${API_URL}/history?limit=200`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Gagal memuat');
        const responseData = await res.json();
        const historyData = responseData.data || [];

        if (historyData.length === 0) {
          setData(null);
          setLoading(false);
          return;
        }

        // Line Chart: group by date
        const dateMap = {};
        let totalKwh = 0;
        let totalCost = 0;

        historyData.forEach(item => {
          totalKwh += item.pred_kwh;
          totalCost += item.est_biaya;
          const dt = new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          if (!dateMap[dt]) dateMap[dt] = 0;
          dateMap[dt] += item.pred_kwh;
        });

        const trend = Object.keys(dateMap).reverse().slice(-7).map(dt => ({
          date: dt,
          kwh: Number(dateMap[dt].toFixed(2))
        }));

        const avgKwh = totalKwh / Object.keys(dateMap).length;
        const lastKwh = historyData[0].pred_kwh;

        setStats({
          totalKwh: totalKwh.toFixed(2),
          avgKwh: avgKwh.toFixed(2),
          cost: totalCost,
          lastKwh: lastKwh.toFixed(2)
        });

        // Bar Chart: count predictions per kategori
        const kategoriCount = { rendah: 0, sedang: 0, tinggi: 0, sangat_tinggi: 0 };
        historyData.forEach(item => {
          if (kategoriCount[item.kategori] !== undefined) kategoriCount[item.kategori]++;
        });
        const kategoriData = [
          { name: 'Rendah',        value: kategoriCount.rendah,        fill: '#10b981' },
          { name: 'Sedang',        value: kategoriCount.sedang,        fill: '#3b82f6' },
          { name: 'Tinggi',        value: kategoriCount.tinggi,        fill: '#f59e0b' },
          { name: 'Sangat Tinggi', value: kategoriCount.sangat_tinggi, fill: '#ef4444' },
        ];

        setData({ trend, kategoriData });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
        <div className="w-10 h-10 border-4 border-emerald border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted text-sm font-medium">Memuat data dashboard...</p>
      </div>
    );
  }

  if (!data && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-fade-in text-center">
        <h3 className="text-xl font-bold mb-2">Selamat Datang, {user?.username}!</h3>
        <p className="text-muted">Anda belum memiliki riwayat prediksi. Yuk mulai buat prediksi pertama Anda.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-primary">Dashboard</h2>
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">Selamat datang kembali, {user?.username}! <span className="text-2xl">👋</span></h3>
          <p className="text-muted text-sm">Pantau dan kelola konsumsi listrik rumah Anda dengan mudah.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
          <Calendar size={16} className="text-muted" />
          <span className="text-sm font-semibold text-primary">Hari ini</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-emerald-50 text-emerald rounded-md"><Clock size={16} /></div>
            <span className="text-xs text-muted font-medium">Prediksi Terbaru</span>
          </div>
          <div className="text-2xl font-bold text-primary mb-1">{stats.lastKwh} kWh</div>
        </div>
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-orange-50 text-orange-500 rounded-md"><Activity size={16} /></div>
            <span className="text-xs text-muted font-medium">Rata-rata Harian</span>
          </div>
          <div className="text-2xl font-bold text-primary mb-1">{stats.avgKwh} kWh</div>
        </div>
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-purple-50 text-purple-500 rounded-md"><Zap size={16} /></div>
            <span className="text-xs text-muted font-medium">Total Konsumsi</span>
          </div>
          <div className="text-2xl font-bold text-primary mb-1">{stats.totalKwh} kWh</div>
        </div>
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-50 text-blue-500 rounded-md"><DollarSign size={16} /></div>
            <span className="text-xs text-muted font-medium">Total Biaya (Estimasi)</span>
          </div>
          <div className="text-2xl font-bold text-primary mb-1">Rp {stats.cost.toLocaleString('id-ID')}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h4 className="font-bold text-sm mb-6 text-primary">Grafik Konsumsi 7 Hari Terakhir</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  labelStyle={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="kwh" name="Konsumsi (kWh)" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card flex flex-col">
          <h4 className="font-bold text-sm mb-4 text-primary">Distribusi Kategori</h4>
          <p className="text-xs text-muted mb-4">Berdasarkan riwayat prediksi</p>
          <div className="flex-grow h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.kategoriData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', fontSize: '12px' }}
                  formatter={(value) => [value, 'Prediksi']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.kategoriData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

- [ ] **Step 2: Verify lint clean**

```bash
cd frontend-react && npx eslint src/pages/Dashboard.jsx
```
Expected: no output

- [ ] **Step 3: Verify in browser**

Navigate to `/dashboard` (logged in, with at least 1 prediction in history).
Expected: pie chart is gone; replaced with bar chart showing counts per category.
Expected: if all predictions are "rendah", only the green bar has a non-zero value.

- [ ] **Step 4: Commit**

```bash
git add frontend-react/src/pages/Dashboard.jsx
git commit -m "feat: replace hardcoded pie chart with real kategori bar chart on Dashboard"
```

---

### Task B2: Predict — real history chart + dynamic comparison

**Files:**
- Modify: `frontend-react/src/pages/Predict.jsx`

**Interfaces:**
- Consumes: `token` from `AuthContext` (add to destructuring)
- Consumes: `GET /api/history?limit=10` — `data[].pred_kwh`, `data[].tanggal`
- Produces: `result.chartData` from real history; `result.comparison` computed dynamically

- [ ] **Step 1: Update `frontend-react/src/pages/Predict.jsx`**

Replace the entire file:
```jsx
import { useState, useContext } from 'react';
import { predictConsumption } from '../services/api';
import {
  Calendar, Clock, Thermometer, Users, Monitor,
  Clock3, Zap, Download,
  Lightbulb, Info, TrendingUp, TrendingDown, Leaf
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AuthContext } from '../context/AuthContext';

const Predict = () => {
  const { token } = useContext(AuthContext);
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    tanggal: today,
    jam: 19,
    suhu: 30,
    penghuni: 4,
    perangkat_aktif: 8,
    jam_pemakaian: 6,
    is_holiday: false,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'radio' && name === 'is_holiday') {
      setFormData(prev => ({ ...prev, is_holiday: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      tanggal: formData.tanggal,
      jam: parseInt(formData.jam),
      suhu_celsius: parseFloat(formData.suhu),
      jumlah_penghuni: parseInt(formData.penghuni),
      jumlah_perangkat_aktif: parseInt(formData.perangkat_aktif),
      jam_penggunaan_rata_rata: parseFloat(formData.jam_pemakaian),
      hari_libur: formData.is_holiday ? 1 : 0,
      konsumsi_7_hari_terakhir: []
    };

    try {
      const data = await predictConsumption(payload);

      // Fetch last 7 history items for chart and comparison
      let historyItems = [];
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const histRes = await fetch(`${API_URL}/history?limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (histRes.ok) {
          const histData = await histRes.json();
          historyItems = histData.data || [];
        }
      } catch { /* ignore history fetch failure */ }

      // Build chart: 7 most recent (oldest first) + today's prediction
      const chartData = historyItems
        .slice(0, 7)
        .reverse()
        .map(h => ({
          date: h.tanggal,
          aktual: parseFloat(h.pred_kwh.toFixed(1)),
        }));
      chartData.push({
        date: formData.tanggal,
        prediksi: parseFloat(data.prediksi.prediksi_kwh.toFixed(1)),
      });

      // Comparison: vs average of last 7
      let comparison = null;
      if (historyItems.length > 0) {
        const slice = historyItems.slice(0, 7);
        const avg = slice.reduce((s, h) => s + h.pred_kwh, 0) / slice.length;
        if (avg > 0) {
          const pct = ((data.prediksi.prediksi_kwh - avg) / avg * 100).toFixed(1);
          comparison = { pct, up: parseFloat(pct) > 0 };
        }
      }

      setResult({
        prediction: data.prediksi,
        kategori: data.prediksi.kategori_konsumsi,
        recommendations: data.rekomendasi.rekomendasi.map(r => ({
          title: `${r.judul}: ${r.deskripsi}`,
          priority: r.prioritas === 'high' ? 'Tinggi' : r.prioritas === 'medium' ? 'Sedang' : 'Rendah',
          savings: `${r.estimasi_hemat_kwh} kWh`
        })),
        chartData,
        comparison,
      });
    } catch {
      setError('Gagal mendapatkan prediksi. Pastikan Anda sudah login dan server berjalan.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto pb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-primary">Prediksi Konsumsi Listrik & Saran</h2>
        <p className="text-muted text-sm">Masukkan data Anda di sebelah kiri untuk melihat prediksi dan saran penghematan secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Form */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-primary">
              <Zap size={18} className="text-emerald" fill="currentColor" />
              Parameter Prediksi
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group mb-0">
                <label className="form-label">Tanggal</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar size={18} className="text-muted" /></div>
                  <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} className="form-control pl-10" required />
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Jam</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Clock size={18} className="text-muted" /></div>
                  <select name="jam" value={formData.jam} onChange={handleChange} className="form-control pl-10" required>
                    {[...Array(24)].map((_, i) => (
                      <option key={i} value={i}>{`${i.toString().padStart(2, '0')}:00`}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Suhu Lingkungan (°C)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Thermometer size={18} className="text-muted" /></div>
                  <input type="number" name="suhu" value={formData.suhu} onChange={handleChange} min="15" max="45" step="0.1" className="form-control pl-10 pr-8" required />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-muted text-sm">°C</span></div>
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label mb-2">Hari Libur</label>
                <div className="flex gap-4 items-center">
                  <label className="form-check cursor-pointer">
                    <input type="radio" name="is_holiday" value="true" checked={formData.is_holiday === true} onChange={handleChange} className="w-4 h-4 text-emerald" />
                    <span className="text-sm text-primary">Ya</span>
                  </label>
                  <label className="form-check cursor-pointer">
                    <input type="radio" name="is_holiday" value="false" checked={formData.is_holiday === false} onChange={handleChange} className="w-4 h-4 text-emerald" />
                    <span className="text-sm text-primary">Tidak</span>
                  </label>
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Jumlah Penghuni</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Users size={18} className="text-muted" /></div>
                  <input type="number" name="penghuni" value={formData.penghuni} onChange={handleChange} min="1" max="15" className="form-control pl-10 pr-16" required />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-muted text-sm">orang</span></div>
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Jumlah Perangkat Aktif</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Monitor size={18} className="text-muted" /></div>
                  <input type="number" name="perangkat_aktif" value={formData.perangkat_aktif} onChange={handleChange} min="0" max="50" className="form-control pl-10 pr-24" required />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-muted text-sm">perangkat</span></div>
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Jam Penggunaan Rata-rata</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Clock3 size={18} className="text-muted" /></div>
                  <input type="number" name="jam_pemakaian" value={formData.jam_pemakaian} onChange={handleChange} min="0" max="24" step="0.5" className="form-control pl-10 pr-20" required />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-muted text-sm">jam/hari</span></div>
                </div>
              </div>
              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              <button type="submit" className="btn btn-primary w-full py-3.5 text-base rounded-xl" disabled={loading}>
                {loading ? 'Memproses...' : 'Tampilkan Prediksi & Saran'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center bg-white border border-gray-100 border-dashed rounded-xl p-12 text-center min-h-[500px]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--accent-primary-light)' }}>
                <Lightbulb size={40} className="text-emerald" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Belum Ada Prediksi</h3>
              <p className="text-muted max-w-md mx-auto mb-8 leading-relaxed">
                Silakan lengkapi parameter prediksi di sebelah kiri dan klik tombol "Tampilkan Prediksi & Saran" untuk melihat estimasi konsumsi listrik beserta rekomendasi penghematannya.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-primary font-semibold"><Zap size={16} className="text-emerald" /> Model AI Akurat</div>
                  <p className="text-xs text-muted">Model kami dilatih menggunakan dataset historis untuk memprediksi konsumsi kWh berdasarkan cuaca dan kebiasaan Anda.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-primary font-semibold"><Leaf size={16} className="text-emerald" /> Saran Penghematan</div>
                  <p className="text-xs text-muted">Selain prediksi, kami juga akan memberikan rekomendasi aksi nyata untuk membantu Anda menekan biaya listrik.</p>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl p-12 text-center min-h-[500px]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
              <div className="w-12 h-12 border-4 border-emerald border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-primary mb-2">Menganalisis Data...</h3>
              <p className="text-sm text-muted">Sedang menghitung prediksi dan merumuskan saran terbaik untuk Anda.</p>
            </div>
          )}

          {result && !loading && (
            <div className="animate-fade-in flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="card relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
                  <p className="text-xs text-emerald mb-1 font-bold uppercase tracking-wider">Estimasi Konsumsi</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-primary">{result.prediction.prediksi_kwh.toFixed(2)}</span>
                    <span className="text-base font-bold text-muted">kWh</span>
                  </div>
                  <p className="text-[11px] text-muted flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(formData.tanggal)} • {formData.jam}:00
                  </p>
                </div>

                <div className="card flex flex-col justify-center">
                  <p className="text-xs text-muted mb-2 font-medium uppercase tracking-wider">Status Pemakaian</p>
                  <div className="mb-2">
                    <span className="badge badge-success px-4 py-1.5 text-sm">{result.kategori || 'Normal'}</span>
                  </div>
                  <p className="text-xs text-muted">Prediksi konsumsi berdasarkan parameter Anda.</p>
                </div>

                <div className="card flex flex-col justify-center">
                  <p className="text-xs text-muted mb-1 font-medium uppercase tracking-wider">Perbandingan</p>
                  {result.comparison ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-2xl font-bold ${result.comparison.up ? 'text-red-500' : 'text-emerald-600'}`}>
                          {result.comparison.up ? '+' : ''}{result.comparison.pct}%
                        </span>
                        <div className={`p-1 rounded ${result.comparison.up ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald'}`}>
                          {result.comparison.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted">Dari rata-rata 7 prediksi terakhir.</p>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-muted">—</span>
                      <p className="text-[11px] text-muted mt-1">Belum ada riwayat untuk perbandingan.</p>
                    </>
                  )}
                </div>
              </div>

              <div className="card border-emerald-100 overflow-hidden relative" style={{ borderColor: 'rgba(16,185,129,0.3)', padding: 0 }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[100px] -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="p-6 relative z-10">
                  <h4 className="font-bold text-emerald text-lg mb-4 flex items-center gap-2" style={{ color: '#059669' }}>
                    <Lightbulb size={22} fill="currentColor" className="text-emerald-400" /> Saran Penghematan (Insight AI)
                  </h4>
                  <p className="text-sm text-primary mb-5">Terapkan saran berikut untuk menurunkan konsumsi listrik Anda pada periode ini:</p>
                  <div className="flex flex-col gap-4">
                    {result.recommendations && result.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start transition-transform hover:-translate-y-0.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx === 0 ? <Zap size={18} fill="currentColor" /> : <Leaf size={18} />}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-primary text-sm mb-1">{rec.title}</h5>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[11px] font-semibold text-emerald bg-emerald-50 px-2 py-0.5 rounded">Potensi Hemat: {rec.savings}</span>
                            <span className="text-[11px] font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded">Prioritas: {rec.priority}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!result.recommendations || result.recommendations.length === 0) && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5"><Info size={18} /></div>
                        <div className="flex-1">
                          <h5 className="font-bold text-primary text-sm mb-1">Pertahankan Efisiensi Anda</h5>
                          <p className="text-xs text-muted">Konsumsi Anda diprediksi sangat optimal. Tidak ada saran mendesak saat ini.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-sm text-primary">Grafik Tren Konsumsi (7 Hari Terakhir vs Prediksi)</h4>
                  <button className="text-muted hover:text-emerald p-1"><Download size={16} /></button>
                </div>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', fontSize: '12px' }}
                        itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" name="Konsumsi Aktual" dataKey="aktual" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                      <Line type="monotone" name="Prediksi (Estimasi)" dataKey="prediksi" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predict;
```

- [ ] **Step 2: Verify lint clean**

```bash
cd frontend-react && npx eslint src/pages/Predict.jsx
```
Expected: no output

- [ ] **Step 3: Verify in browser**

Navigate to `/predict`, submit a prediction.
Expected: chart shows real history data (not random numbers).
Expected: "Perbandingan" card shows a calculated percentage (or "—" if no history).

- [ ] **Step 4: Commit**

```bash
git add frontend-react/src/pages/Predict.jsx
git commit -m "feat: replace mock chart data with real history in Predict page"
```

---

### Task B3: Analysis — fix all hardcoded values

**Files:**
- Modify: `frontend-react/src/pages/Analysis.jsx`

**Interfaces:**
- Consumes: `/api/history?limit=200` — `pred_kwh`, `kategori`, `tanggal`, `jam`, `suhu`, `perangkat_aktif`
- Produces: all computed values dynamic; pie chart replaced with kategori bar chart

- [ ] **Step 1: Update `frontend-react/src/pages/Analysis.jsx`**

Replace the entire file:
```jsx
import { useState, useEffect, useContext } from 'react';
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Zap, TrendingUp, TrendingDown, Clock, Info } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Analysis = () => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [stats, setStats] = useState({ total: 0, avg: 0, max: 0, maxDate: '', peakHour: '' });

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${API_URL}/history?limit=200`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Gagal memuat');
        const responseData = await res.json();
        const historyData = responseData.data || [];

        if (historyData.length === 0) {
          setData(null);
          setLoading(false);
          return;
        }

        // 1. Trend data (group by date)
        const dateMap = {};
        let totalKwh = 0;
        let maxKwh = 0;
        let maxDate = '';

        historyData.forEach(item => {
          totalKwh += item.pred_kwh;
          const dt = new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          if (!dateMap[dt]) dateMap[dt] = 0;
          dateMap[dt] += item.pred_kwh;
          if (dateMap[dt] > maxKwh) { maxKwh = dateMap[dt]; maxDate = dt; }
        });

        const avgKwh = totalKwh / Object.keys(dateMap).length;
        const trend = Object.keys(dateMap).reverse().map(dt => ({
          date: dt,
          aktual: Number(dateMap[dt].toFixed(2)),
          rata: Number(avgKwh.toFixed(2))
        }));

        // 2. Kategori bar chart (replaces pie chart)
        const kategoriCount = { rendah: 0, sedang: 0, tinggi: 0, sangat_tinggi: 0 };
        historyData.forEach(item => {
          if (kategoriCount[item.kategori] !== undefined) kategoriCount[item.kategori]++;
        });
        const kategoriData = [
          { name: 'Rendah',        value: kategoriCount.rendah,        fill: '#10b981' },
          { name: 'Sedang',        value: kategoriCount.sedang,        fill: '#3b82f6' },
          { name: 'Tinggi',        value: kategoriCount.tinggi,        fill: '#f59e0b' },
          { name: 'Sangat Tinggi', value: kategoriCount.sangat_tinggi, fill: '#ef4444' },
        ];

        // 3. Hourly bar chart (real data only, no random fallback)
        const hourlyMap = {};
        historyData.forEach(item => {
          const hr = item.jam;
          if (!hourlyMap[hr]) hourlyMap[hr] = { total: 0, count: 0 };
          hourlyMap[hr].total += item.pred_kwh;
          hourlyMap[hr].count++;
        });
        const hourly = Object.entries(hourlyMap)
          .map(([hr, v]) => ({
            time: `${hr.toString().padStart(2, '0')}:00`,
            value: parseFloat((v.total / v.count).toFixed(1))
          }))
          .sort((a, b) => parseInt(a.time) - parseInt(b.time));

        // 4. Peak hour from real data
        const peakEntry = hourly.reduce(
          (max, h) => h.value > max.value ? h : max,
          { time: '—', value: 0 }
        );

        // 5. Dynamic date range
        const sortedDates = historyData.map(h => h.tanggal).filter(Boolean).sort();
        const dateRangeLabel = sortedDates.length >= 2
          ? `${sortedDates[0]} – ${sortedDates[sortedDates.length - 1]}`
          : sortedDates.length === 1 ? sortedDates[0] : '—';

        // 6. Dynamic insights
        const half = Math.floor(historyData.length / 2);
        let trendText = '—';
        let trendUp = true;
        if (half > 0 && historyData.length > 1) {
          const recentAvg = historyData.slice(0, half).reduce((s, h) => s + h.pred_kwh, 0) / half;
          const olderAvg = historyData.slice(half).reduce((s, h) => s + h.pred_kwh, 0) / (historyData.length - half);
          if (olderAvg > 0) {
            const pct = ((recentAvg - olderAvg) / olderAvg * 100).toFixed(1);
            trendUp = parseFloat(pct) > 0;
            trendText = trendUp ? `Meningkat ${pct}%` : `Menurun ${Math.abs(pct)}%`;
          }
        }

        const avgSuhu = (historyData.reduce((s, h) => s + (h.suhu || 0), 0) / historyData.length).toFixed(1);
        const avgPerangkat = Math.round(historyData.reduce((s, h) => s + (h.perangkat_aktif || 0), 0) / historyData.length);

        setStats({
          total: totalKwh.toFixed(2),
          avg: avgKwh.toFixed(2),
          max: maxKwh.toFixed(2),
          maxDate,
          peakHour: peakEntry.time,
        });

        setData({ trend, kategoriData, hourly, dateRangeLabel, trendText, trendUp, avgSuhu, avgPerangkat });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAnalysisData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
        <div className="w-10 h-10 border-4 border-emerald border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted text-sm font-medium">Memuat data analisis...</p>
      </div>
    );
  }

  if (!data && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-fade-in text-center">
        <h3 className="text-xl font-bold mb-2">Belum ada data</h3>
        <p className="text-muted">Lakukan prediksi terlebih dahulu untuk melihat analisis ini.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-primary">Analisis Konsumsi</h2>
          <p className="text-muted text-sm">Lihat pola dan tren konsumsi listrik rumah Anda dalam berbagai periode.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm">
          <Calendar size={16} className="text-muted" />
          <span className="text-sm font-semibold text-primary">{data.dateRangeLabel}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-emerald-50 text-emerald rounded-md"><Zap size={18} fill="currentColor" /></div>
            <span className="text-sm text-muted font-medium">Total Konsumsi</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">{stats.total} kWh</div>
            <div className="text-[11px] text-muted">seluruh riwayat prediksi</div>
          </div>
        </div>
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-md"><TrendingUp size={18} /></div>
            <span className="text-sm text-muted font-medium">Rata-rata Harian</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">{stats.avg} kWh</div>
            <div className="text-[11px] text-muted">berdasarkan riwayat</div>
          </div>
        </div>
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-purple-50 text-purple-500 rounded-md"><Calendar size={18} /></div>
            <span className="text-sm text-muted font-medium">Hari Tertinggi</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">{stats.max} kWh</div>
            <div className="text-[11px] text-muted">{stats.maxDate}</div>
          </div>
        </div>
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-md"><Clock size={18} /></div>
            <span className="text-sm text-muted font-medium">Jam Puncak</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">{stats.peakHour}</div>
            <div className="text-[11px] text-muted">Rata-rata konsumsi tertinggi</div>
          </div>
        </div>
      </div>

      {/* Middle Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h4 className="font-bold text-sm mb-6 text-primary">Tren Konsumsi Harian</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
                  itemStyle={{ fontWeight: 600 }}
                  labelStyle={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" name="Konsumsi Aktual" dataKey="aktual" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Rata-rata" dataKey="rata" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card flex flex-col">
          <h4 className="font-bold text-sm mb-4 text-primary">Distribusi Kategori Konsumsi</h4>
          <div className="flex-grow h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.kategoriData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', fontSize: '12px' }}
                  formatter={(value) => [value, 'Prediksi']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.kategoriData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-sm text-primary">Konsumsi per Jam (Rata-rata)</h4>
            <span className="text-[10px] text-muted">{data.hourly.length === 0 ? 'Belum ada data per jam' : `${data.hourly.length} slot jam`}</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourly} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(16,185,129,0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.hourly.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.time === stats.peakHour ? '#10b981' : '#a7f3d0'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card flex flex-col">
          <h4 className="font-bold text-sm mb-4 text-primary">Insight Ringkasan</h4>
          <div className="flex flex-col gap-4 flex-grow">
            <div className="flex items-start gap-3 p-3 rounded-lg border" style={{ backgroundColor: 'var(--accent-primary-light)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <div className={`mt-0.5 ${data.trendUp ? 'text-emerald' : 'text-blue-500'}`}>
                {data.trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <div>
                <p className="text-xs font-bold text-emerald mb-0.5">Tren konsumsi: {data.trendText}</p>
                <p className="text-[11px] text-muted leading-relaxed">Konsumsi rata-rata dibanding periode sebelumnya.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border-b border-gray-100 pb-4">
              <div className="text-blue-500 mt-0.5 bg-blue-50 p-1.5 rounded"><Clock size={14} /></div>
              <div>
                <p className="text-xs font-bold text-primary mb-0.5">Jam puncak: {stats.peakHour}</p>
                <p className="text-[11px] text-muted leading-relaxed">Konsumsi tertinggi rata-rata terjadi pada jam ini.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border-b border-gray-100 pb-4">
              <div className="text-orange-500 mt-0.5 bg-orange-50 p-1.5 rounded"><Info size={14} /></div>
              <div>
                <p className="text-xs font-bold text-primary mb-0.5">Suhu rata-rata: {data.avgSuhu}°C</p>
                <p className="text-[11px] text-muted leading-relaxed">Rata-rata suhu dari seluruh sesi prediksi Anda.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3">
              <div className="text-purple-500 mt-0.5 bg-purple-50 p-1.5 rounded"><Zap size={14} /></div>
              <div>
                <p className="text-xs font-bold text-primary mb-0.5">Rata-rata {data.avgPerangkat} perangkat aktif</p>
                <p className="text-[11px] text-muted leading-relaxed">Rata-rata jumlah perangkat aktif per sesi prediksi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-lg text-[11px] text-muted">
        <Info size={14} className="text-emerald flex-shrink-0" />
        Data ditampilkan berdasarkan input yang Anda masukkan dan riwayat prediksi yang tersedia.
      </div>
    </div>
  );
};

export default Analysis;
```

- [ ] **Step 2: Verify lint clean**

```bash
cd frontend-react && npx eslint src/pages/Analysis.jsx
```
Expected: no output

- [ ] **Step 3: Verify in browser**

Navigate to `/analysis` (logged in with history data).
Expected: pie chart gone; replaced with bar chart per kategori.
Expected: date range shows real min–max dates from history (not "10 Juni 2026 - 16 Juni 2026").
Expected: jam puncak shows real peak hour from history.
Expected: insights show real calculated values for trend %, suhu rata-rata, perangkat rata-rata.
Expected: hourly bar chart shows only hours that have real data (no random bars).

- [ ] **Step 4: Commit**

```bash
git add frontend-react/src/pages/Analysis.jsx
git commit -m "feat: replace all hardcoded chart data with real history in Analysis page"
```
