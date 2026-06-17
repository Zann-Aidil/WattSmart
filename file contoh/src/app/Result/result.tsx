"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ResultBreakdownChart } from "../../components/Result/ResultBreakdownChart";
import { ResultEfficiencyGauge } from "../../components/Result/ResultEfficiencyGauge";
import { ResultComparison } from "../../components/Result/ResultComparison";

type ApplianceBreakdown = {
  nama: string; kwh: number; persentase: number; biaya: number; icon: string;
};
type PredictionResult = {
  prediksi_kwh: number; prediksi_tagihan: number; confidence: number;
  kategori: "Hemat" | "Normal" | "Boros" | "Sangat Boros";
  persentase_vs_rata_rata: number; breakdown: ApplianceBreakdown[];
};

const DEMO_RESULT: PredictionResult = {
  prediksi_kwh: 312.4, prediksi_tagihan: 449856, confidence: 94.2,
  kategori: "Normal", persentase_vs_rata_rata: 8.5,
  breakdown: [
    { nama: "AC",          kwh: 129.6, persentase: 41.5, biaya: 186624, icon: "❄️" },
    { nama: "Lampu",       kwh: 48.0,  persentase: 15.4, biaya: 69120,  icon: "💡" },
    { nama: "Kulkas",      kwh: 36.0,  persentase: 11.5, biaya: 51840,  icon: "🧊" },
    { nama: "TV",          kwh: 30.0,  persentase: 9.6,  biaya: 43200,  icon: "📺" },
    { nama: "Komputer",    kwh: 28.8,  persentase: 9.2,  biaya: 41472,  icon: "💻" },
    { nama: "Mesin Cuci",  kwh: 21.0,  persentase: 6.7,  biaya: 30240,  icon: "🌀" },
    { nama: "Lainnya",     kwh: 19.0,  persentase: 6.1,  biaya: 27360,  icon: "⚡" },
  ],
};

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const KATEGORI_STYLE: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Hemat:          { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  Normal:         { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    dot: "bg-blue-500"    },
  Boros:          { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   dot: "bg-amber-500"   },
  "Sangat Boros": { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     dot: "bg-red-500"     },
};

function KategoriBadge({ kategori }: { kategori: string }) {
  const s = KATEGORI_STYLE[kategori] ?? KATEGORI_STYLE["Normal"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.border} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {kategori}
    </span>
  );
}

const KATEGORI_HEADER_BG: Record<string, string> = {
  Hemat:          "bg-emerald-50 border-emerald-100",
  Normal:         "bg-blue-50 border-blue-100",
  Boros:          "bg-amber-50 border-amber-100",
  "Sangat Boros": "bg-red-50 border-red-100",
};

export default function ResultPage() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token"); // asumsi token disimpan di localStorage
        const res = await fetch("http://localhost:8000/api/predict/history", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Ambil prediksi terbaru
            const latest = data[0];
            
            const totalKwh = latest.konsumsi_kwh_hari * 30;
            const totalTagihan = latest.estimasi_tagihan_bulan;
            
            // Kalkulasi detail per perangkat
            const breakdown = latest.devices.map((d: any) => {
              const kwh = (d.power * d.hours / 1000) * d.jumlah * 30;
              const persentase = totalKwh > 0 ? (kwh / totalKwh) * 100 : 0;
              const biaya = totalTagihan > 0 ? (persentase / 100) * totalTagihan : 0;
              
              // Icon sederhana berdasarkan nama
              let icon = "⚡";
              const n = d.name.toLowerCase();
              if (n.includes("ac")) icon = "❄️";
              else if (n.includes("lampu")) icon = "💡";
              else if (n.includes("kulkas")) icon = "🧊";
              else if (n.includes("tv")) icon = "📺";
              else if (n.includes("komputer") || n.includes("pc") || n.includes("laptop")) icon = "💻";
              else if (n.includes("mesin cuci")) icon = "🌀";

              return {
                nama: d.name,
                kwh,
                persentase,
                biaya,
                icon
              };
            });

            // Format data dari DB ke PredictionResult structure
            const formattedResult: PredictionResult = {
              prediksi_kwh: totalKwh,
              prediksi_tagihan: totalTagihan,
              confidence: 94.2, 
              kategori: latest.estimasi_tagihan_bulan > 500000 ? "Boros" : "Normal",
              persentase_vs_rata_rata: totalKwh > 200 ? ((totalKwh - 200) / 200 * 100) : -10.5,
              breakdown
            };
            setResult(formattedResult);
          } else {
            // Fallback if empty
             const stored = sessionStorage.getItem("prediction_result");
             setResult(stored ? JSON.parse(stored) : DEMO_RESULT);
          }
        } else {
           const stored = sessionStorage.getItem("prediction_result");
           setResult(stored ? JSON.parse(stored) : DEMO_RESULT);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
        const stored = sessionStorage.getItem("prediction_result");
        setResult(stored ? JSON.parse(stored) : DEMO_RESULT);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // 2. Setup WebSocket untuk Realtime
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "NEW_PREDICTION") {
        fetchHistory(); // Refresh data jika ada update realtime
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-400">Memproses prediksi...</p>
      </div>
    </div>
  );
  if (!result) return null;

  const headerBg = KATEGORI_HEADER_BG[result.kategori] ?? KATEGORI_HEADER_BG["Normal"];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <a href="/Input" className="inline-flex items-center gap-2 text-gray-400 text-sm hover:text-gray-600 transition-colors mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Ubah Data Input
            </a>
            <h1 className="font-syne text-3xl font-bold text-gray-900">Hasil Prediksi</h1>
            <p className="text-sm text-gray-500 mt-1">Estimasi konsumsi listrik bulanan rumah Anda</p>
          </div>
          <Link href="/Recommendations" className="btn-primary px-5 py-2.5 text-sm">
            💡 Lihat Rekomendasi
          </Link>
        </div>

        {/* Main card */}
        <div className={`rounded-2xl p-8 mb-5 border ${headerBg}`}>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <KategoriBadge kategori={result.kategori} />
                <span className="text-xs text-gray-400">Akurasi model {result.confidence}%</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">Estimasi Konsumsi Listrik</p>
              <p className="font-syne font-extrabold text-gray-900 leading-none" style={{ fontSize: 52 }}>
                {result.prediksi_kwh.toFixed(1)}
                <span className="text-xl font-normal text-gray-400 ml-2">kWh</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">per bulan</p>

              <div className="flex items-center gap-6 mt-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Tagihan Listrik</p>
                  <p className="font-syne font-bold text-gray-900 text-xl">{formatRupiah(result.prediksi_tagihan)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">estimasi per bulan</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">vs Rata-rata Nasional</p>
                  <p className={`font-syne font-bold text-xl ${result.persentase_vs_rata_rata > 0 ? "text-amber-500" : "text-emerald-600"}`}>
                    {result.persentase_vs_rata_rata > 0 ? "+" : ""}{result.persentase_vs_rata_rata.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {result.persentase_vs_rata_rata > 0 ? "di atas rata-rata" : "di bawah rata-rata"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <ResultEfficiencyGauge kategori={result.kategori} />
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-5 mb-5">
          <div className="card p-6">
            <h3 className="font-syne font-semibold text-gray-900 mb-5">Distribusi per Perangkat</h3>
            <ResultBreakdownChart data={result.breakdown} />
          </div>
          <div className="card p-6">
            <h3 className="font-syne font-semibold text-gray-900 mb-5">Perbandingan Konsumsi</h3>
            <ResultComparison kwh={result.prediksi_kwh} />
          </div>
        </div>

        {/* Detail table */}
        <div className="card p-6 mb-5">
          <h3 className="font-syne font-semibold text-gray-900 mb-4">Detail Konsumsi per Perangkat</h3>
          <div className="grid grid-cols-4 gap-4 pb-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100">
            <span>Perangkat</span>
            <span className="text-right">kWh/bulan</span>
            <span className="text-right">Porsi</span>
            <span className="text-right">Biaya/bulan</span>
          </div>
          {result.breakdown.map((item) => (
            <div key={item.nama} className="grid grid-cols-4 gap-4 py-3 text-sm border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span className="text-gray-700">{item.nama}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-900 font-medium">{item.kwh.toFixed(1)}</span>
                <span className="text-xs text-gray-400 ml-1">kWh</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${item.persentase}%` }} />
                </div>
                <span className="text-xs text-gray-500">{item.persentase.toFixed(0)}%</span>
              </div>
              <div className="text-right text-xs text-gray-500">{formatRupiah(item.biaya)}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/Recommendations" className="btn-primary flex-1 py-4">
            💡 Lihat Rekomendasi Efisiensi
          </Link>
          <Link href="/History" className="btn-secondary px-6 py-4">📊 Riwayat</Link>
          <Link href="/Input" className="btn-secondary px-6 py-4">🔄 Hitung Ulang</Link>
        </div>
      </div>
    </div>
  );
}