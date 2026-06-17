"use client";

import Link from "next/link";
import { Zap, PlayCircle, CheckCircle, Shield, Leaf } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-6">
              <Leaf className="w-4 h-4" />
              Prediksi Cerdas untuk Rumah Anda
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
              Prediksi Konsumsi Listrik, <span className="text-emerald-600">Hemat Energi,</span> Hidup Lebih Cerdas
            </h1>
            
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
              Masukkan data perangkat elektronik rumah Anda, dan sistem kami akan memprediksi konsumsi listrik bulanan serta memberikan rekomendasi efisiensi energi yang dipersonalisasi.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
              <Link
                href="/Input"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200"
              >
                <Zap className="w-5 h-5 fill-current" />
                Mulai Prediksi Sekarang &rarr;
              </Link>
              <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold text-emerald-600 bg-white border-2 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-200">
                <PlayCircle className="w-5 h-5" />
                Pelajari Cara Kerja
              </button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 lg:gap-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-gray-900">Akurasi Tinggi</div>
                  <div className="text-xs text-gray-500">94.2% akurasi</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-gray-900">Hasil Instan</div>
                  <div className="text-xs text-gray-500">Dalam hitungan detik</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-gray-900">Data Aman</div>
                  <div className="text-xs text-gray-500">Privasi terjamin</div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right Image/Illustration - Mockup representation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex-1 w-full relative"
          >
            {/* Background glowing blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-50/50 rounded-full blur-3xl -z-10"></div>
            
            {/* Window Mockup */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative z-10 transform lg:translate-x-4 lg:-rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="p-6">
                {/* Dashboard Skeleton to look like mockup */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900">Selamat datang, Fauzan!</h3>
                    <p className="text-xs text-gray-500">Pantau dan kelola konsumsi listrik Anda.</p>
                  </div>
                  <div className="px-3 py-1 rounded bg-gray-100 text-xs font-medium text-gray-600">
                    16 Juni 2026
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="text-xs text-gray-600 mb-1">Prediksi Bulan Ini</div>
                    <div className="text-2xl font-bold text-emerald-700">569.4 kWh</div>
                    <div className="text-[10px] text-emerald-600 mt-2">+8.5% dari kemarin</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-600 mb-1">Potensi Hemat</div>
                    <div className="text-2xl font-bold text-gray-900">Rp 87.300</div>
                    <div className="text-[10px] text-emerald-600 mt-2">12.3% dari bulan lalu</div>
                  </div>
                </div>
                
                <div className="h-32 bg-gray-50 rounded-xl border border-gray-100 flex items-end justify-between p-4 px-6">
                   {/* Fake Chart bars */}
                   {[40, 60, 45, 80, 55, 70, 90, 65].map((height, i) => (
                     <div key={i} className="w-4 bg-emerald-200 rounded-t-sm" style={{ height: `${height}%` }}>
                       <div className="w-full bg-emerald-500 rounded-t-sm" style={{ height: '70%' }}></div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
      
      {/* City/House vector landscape at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 opacity-10 pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 1000 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 200V150l50-50 50 50v50H0zm150 0v-80l60-60 60 60v80h-120zm180 0V100l40-40 40 40v100h-80zm140 0v-60l50-50 50 50v60h-100zm180 0v-90l40-40 40 40v90h-80zm150 0v-50l30-30 30 30v50h-60z\' fill=\'%23059669\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'bottom center',
        backgroundSize: '800px 100%'
      }}></div>
    </div>
  );
}
