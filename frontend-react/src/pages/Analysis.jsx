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
