"use client";

import { DashboardLayout } from "@/src/components/Dashboard/Layout";
import { Clock, TrendingDown, Calendar, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const lineData = [
  { name: "17 Mei", prediksi: 8, aktual: 7 },
  { name: "21 Mei", prediksi: 16, aktual: 15 },
  { name: "25 Mei", prediksi: 10, aktual: 12 },
  { name: "29 Mei", prediksi: 22, aktual: 0 },
  { name: "2 Jun", prediksi: 15, aktual: 0 },
  { name: "6 Jun", prediksi: 24, aktual: 0 },
  { name: "10 Jun", prediksi: 12, aktual: 0 },
  { name: "14 Jun", prediksi: 25, aktual: 0 },
  { name: "16 Jun", prediksi: 14, aktual: 0 },
];

const pieData = [
  { name: "AC", value: 42.3, color: "#10B981" }, // emerald-500
  { name: "Kulkas", value: 18.6, color: "#3B82F6" }, // blue-500
  { name: "Mesin Cuci", value: 12.4, color: "#14B8A6" }, // teal-500
  { name: "TV", value: 9.7, color: "#F59E0B" }, // amber-500
  { name: "Lampu", value: 8.1, color: "#8B5CF6" }, // violet-500
  { name: "Lainnya", value: 8.9, color: "#6366F1" }, // indigo-500
];

export default function BerandaPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Selamat datang, Fauzan!</h1>
            <p className="text-sm text-gray-500">Pantau dan kelola konsumsi listrik rumah Anda dengan mudah.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">16 Juni 2026</span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex flex-col justify-between">
            <div className="text-emerald-800 font-medium text-sm mb-2">Prediksi Bulan Ini</div>
            <div className="text-4xl font-bold text-emerald-600 mb-6">569.4 <span className="text-xl font-medium">kWh</span></div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">Est. Tagihan</div>
                <div className="font-bold text-gray-900">Rp 822.612</div>
              </div>
              <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                Sangat Boros
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-gray-500 font-medium text-sm">Rata-rata Harian</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-4">18.45 <span className="text-lg font-medium text-gray-500">kWh</span></div>
            <div className="flex items-center gap-1 text-xs font-medium text-red-500">
               <TrendingDown className="h-4 w-4 rotate-180" />
               + 8.5% dari kemarin
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <TrendingDown className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="text-gray-500 font-medium text-sm">Potensi Hemat</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-4">Rp 87.300</div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-500">
               <TrendingDown className="h-4 w-4" />
               12.3% dari bulan lalu
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-gray-900">Grafik Prediksi 30 Hari</h3>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-4 h-1 rounded-full bg-emerald-500"></span> Prediksi
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-4 h-1 rounded-full bg-gray-300 border-t border-dashed border-gray-400"></span> Aktual
                </div>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="prediksi" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2 }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="aktual" 
                    stroke="#9CA3AF" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-900 mb-6">Distribusi Konsumsi</h3>
            <div className="flex-1 relative flex items-center justify-center">
              {/* Custom Legend layout to match mockup */}
              <div className="absolute inset-0 flex items-center justify-between">
                <div className="w-1/2 h-full relative -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-xl font-bold text-gray-900">18.45</span>
                     <span className="text-xs text-gray-500">kWh</span>
                  </div>
                </div>
                
                <div className="w-1/2 flex flex-col gap-3 justify-center pl-2">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        {item.name}
                      </div>
                      <span className="text-gray-500">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
