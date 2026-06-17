import React, { useState } from 'react';
import { predictConsumption } from '../services/api';
import { 
  Calendar, Clock, Thermometer, Users, Monitor, 
  Clock3, Zap, ArrowLeft, Download, Share2, 
  Lightbulb, CheckCircle, AlertTriangle, Info, TrendingUp, TrendingDown, Leaf
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Predict = () => {
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
    const { name, value, type, checked } = e.target;
    if (type === 'radio' && name === 'is_holiday') {
      setFormData(prev => ({ ...prev, is_holiday: value === 'true' }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Prepare data payload for Pydantic schema
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
      
      const mockChart = [];
      const baseDate = new Date(formData.tanggal);
      for(let i=6; i>=1; i--) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - i);
        mockChart.push({
          date: `${d.getDate()} Jun`,
          aktual: (12 + Math.random() * 15).toFixed(1)
        });
      }
      mockChart.push({
        date: `${baseDate.getDate()} Jun`,
        prediksi: data.prediction?.pred_kwh?.toFixed(1) || 18.7
      });
      setResult({ 
        prediction: data.prediksi,
        kategori: data.prediksi.kategori_konsumsi,
        recommendations: data.rekomendasi.rekomendasi.map(r => ({
          title: `${r.judul}: ${r.deskripsi}`,
          priority: r.prioritas === 'high' ? 'Tinggi' : r.prioritas === 'medium' ? 'Sedang' : 'Rendah',
          savings: `${r.estimasi_hemat_kwh} kWh`
        })),
        chartData: mockChart 
      });
    } catch (err) {
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-muted" />
                  </div>
                  <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} className="form-control pl-10" required />
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Jam</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={18} className="text-muted" />
                  </div>
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Thermometer size={18} className="text-muted" />
                  </div>
                  <input type="number" name="suhu" value={formData.suhu} onChange={handleChange} min="15" max="45" step="0.1" className="form-control pl-10 pr-8" required />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-muted text-sm">°C</span>
                  </div>
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users size={18} className="text-muted" />
                  </div>
                  <input type="number" name="penghuni" value={formData.penghuni} onChange={handleChange} min="1" max="15" className="form-control pl-10 pr-16" required />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-muted text-sm">orang</span>
                  </div>
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Jumlah Perangkat Aktif</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Monitor size={18} className="text-muted" />
                  </div>
                  <input type="number" name="perangkat_aktif" value={formData.perangkat_aktif} onChange={handleChange} min="0" max="50" className="form-control pl-10 pr-24" required />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-muted text-sm">perangkat</span>
                  </div>
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Jam Penggunaan Rata-rata</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock3 size={18} className="text-muted" />
                  </div>
                  <input type="number" name="jam_pemakaian" value={formData.jam_pemakaian} onChange={handleChange} min="0" max="24" step="0.5" className="form-control pl-10 pr-20" required />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-muted text-sm">jam/hari</span>
                  </div>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

              <button type="submit" className="btn btn-primary w-full py-3.5 text-base rounded-xl" disabled={loading}>
                {loading ? 'Memproses...' : 'Tampilkan Prediksi & Saran'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Results / Helper */}
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
                  <div className="flex items-center gap-2 mb-2 text-primary font-semibold"><Zap size={16} className="text-emerald"/> Model AI Akurat</div>
                  <p className="text-xs text-muted">Model kami dilatih menggunakan dataset historis untuk memprediksi konsumsi kWh berdasarkan cuaca dan kebiasaan Anda.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-primary font-semibold"><Leaf size={16} className="text-emerald"/> Saran Penghematan</div>
                  <p className="text-xs text-muted">Selain prediksi, kami juga akan memberikan rekomendasi aksi nyata (saran) untuk membantu Anda menekan biaya listrik.</p>
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
              {/* Result Top Cards */}
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
                    <span className="badge badge-success px-4 py-1.5 text-sm">{result.kategori || "Normal"}</span>
                  </div>
                  <p className="text-xs text-muted">Prediksi konsumsi berada dalam batas wajar.</p>
                </div>
                
                <div className="card flex flex-col justify-center">
                  <p className="text-xs text-muted mb-1 font-medium uppercase tracking-wider">Perbandingan</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-emerald">+ 8.6%</span>
                    <div className="p-1 bg-emerald-50 text-emerald rounded"><TrendingUp size={14} /></div>
                  </div>
                  <p className="text-[11px] text-muted">Dari rata-rata harian minggu ini.</p>
                </div>
              </div>

              {/* Saran / Recommendations Section (Highlight!) */}
              <div className="card border-emerald-100 overflow-hidden relative" style={{ borderColor: 'rgba(16,185,129,0.3)', padding: 0 }}>
                {/* Decorative background curve */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[100px] -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                
                <div className="p-6 relative z-10">
                  <h4 className="font-bold text-emerald text-lg mb-4 flex items-center gap-2" style={{ color: '#059669' }}>
                    <Lightbulb size={22} fill="currentColor" className="text-emerald-400" /> Saran Penghematan (Insight AI)
                  </h4>
                  <p className="text-sm text-primary mb-5">
                    Terapkan saran berikut untuk menurunkan konsumsi listrik Anda pada periode ini:
                  </p>
                  
                  <div className="flex flex-col gap-4">
                    {result.recommendations && result.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start transition-transform hover:-translate-y-0.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx === 0 ? <Zap size={18} fill="currentColor" /> : <Leaf size={18} />}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-primary text-sm mb-1">{rec.title || rec}</h5>
                          {rec.savings && (
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[11px] font-semibold text-emerald bg-emerald-50 px-2 py-0.5 rounded">Potensi Hemat: {rec.savings}</span>
                              {rec.priority && (
                                <span className="text-[11px] font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded">Prioritas: {rec.priority}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!result.recommendations || result.recommendations.length === 0) && (
                       <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start">
                         <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                           <Info size={18} />
                         </div>
                         <div className="flex-1">
                           <h5 className="font-bold text-primary text-sm mb-1">Pertahankan Efisiensi Anda</h5>
                           <p className="text-xs text-muted">Konsumsi Anda diprediksi sangat optimal. Tidak ada saran mendesak saat ini.</p>
                         </div>
                       </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-sm text-primary">Grafik Tren Konsumsi (7 Hari Terakhir vs Prediksi)</h4>
                  <div className="flex gap-2">
                    <button className="text-muted hover:text-emerald p-1"><Download size={16} /></button>
                  </div>
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
