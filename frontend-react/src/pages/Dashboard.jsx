import React, { useState, useEffect, useContext } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, DollarSign, Calendar, Activity, Zap, TrendingUp, TrendingDown } from 'lucide-react';
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
          const dt = new Date(item.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
          if(!dateMap[dt]) dateMap[dt] = 0;
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

        // Pie Chart: Distribusi (Dummy logic, can be improved later)
        const distribusi = [
          { name: 'Perangkat', value: 45, color: '#10b981' }, 
          { name: 'Pencahayaan', value: 20, color: '#3b82f6' }, 
          { name: 'Elektronik', value: 15, color: '#f59e0b' }, 
          { name: 'Lainnya', value: 20, color: '#8b5cf6' } 
        ];

        setData({ trend, distribusi });
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
        {/* Card 1 */}
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-emerald-50 text-emerald rounded-md"><Clock size={16} /></div>
            <span className="text-xs text-muted font-medium">Prediksi Terbaru</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">{stats.lastKwh} kWh</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-orange-50 text-orange-500 rounded-md"><Activity size={16} /></div>
            <span className="text-xs text-muted font-medium">Rata-rata Harian</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">{stats.avgKwh} kWh</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-purple-50 text-purple-500 rounded-md"><Zap size={16} /></div>
            <span className="text-xs text-muted font-medium">Total Konsumsi</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">{stats.totalKwh} kWh</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-50 text-blue-500 rounded-md"><DollarSign size={16} /></div>
            <span className="text-xs text-muted font-medium">Total Biaya (Estimasi)</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">Rp {stats.cost.toLocaleString('id-ID')}</div>
          </div>
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
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 11}} />
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
          <h4 className="font-bold text-sm mb-4 text-primary">Distribusi Konsumsi</h4>
          <div className="flex-grow flex items-center justify-center">
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.distribusi}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.distribusi.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Distribusi']} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend */}
              <div className="absolute top-0 right-0 h-full flex flex-col justify-center gap-2">
                {data.distribusi.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-[10px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-muted w-16">{entry.name}</span>
                    <span className="font-bold text-primary">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
