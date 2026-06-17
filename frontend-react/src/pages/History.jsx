import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { History as HistoryIcon, Calendar, Clock, Zap, AlertCircle } from 'lucide-react';

const History = () => {
  const { token } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Gagal memuat riwayat');
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  const formatDate = (isoString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(isoString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
          <HistoryIcon size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Riwayat Prediksi</h2>
          <p className="text-sm text-gray-500">Semua data simulasi prediksi yang pernah Anda buat</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-500">Memuat data...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
            <HistoryIcon size={40} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Riwayat</h3>
          <p className="text-gray-500 text-sm">Anda belum melakukan prediksi apa pun. Buka menu Prediksi untuk memulai.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                  <th className="p-4 font-semibold">Tanggal (Target)</th>
                  <th className="p-4 font-semibold">Jam</th>
                  <th className="p-4 font-semibold">Faktor</th>
                  <th className="p-4 font-semibold">Hasil (kWh)</th>
                  <th className="p-4 font-semibold">Biaya (Estimasi)</th>
                  <th className="p-4 font-semibold">Kategori</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(h.tanggal)}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock size={14} /> {h.jam}:00
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-gray-500 flex flex-col gap-1">
                        <span>{h.perangkat_aktif} prgkt • {h.jam_pemakaian} jam</span>
                        <span>{h.suhu}°C • {h.penghuni} org</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-bold text-emerald-600">
                        <Zap size={14} fill="currentColor" /> {h.pred_kwh.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      Rp {h.est_biaya.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        h.kategori === 'rendah' ? 'bg-emerald-50 text-emerald-600' :
                        h.kategori === 'sedang' ? 'bg-blue-50 text-blue-600' :
                        h.kategori === 'tinggi' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {h.kategori.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
