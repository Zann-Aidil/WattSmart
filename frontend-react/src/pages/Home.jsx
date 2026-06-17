import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, PlayCircle, CheckCircle, Shield, Leaf, TrendingUp, ShieldCheck, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Prediksi Akurat",
    description: "Algoritma cerdas dengan akurasi hingga 94.2% untuk perencanaan energi yang lebih baik.",
    icon: TrendingUp,
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600"
  },
  {
    title: "Rekomendasi Personal",
    description: "Saran penghematan yang disesuaikan dengan pola penggunaan listrik rumah Anda.",
    icon: Leaf,
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  {
    title: "Hemat Biaya",
    description: "Kurangi tagihan listrik hingga 20% dengan tips dan rekomendasi yang tepat.",
    icon: ShieldCheck,
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600"
  },
  {
    title: "Pantau Mudah",
    description: "Dashboard intuitif untuk memantau konsumsi listrik kapan saja dan di mana saja.",
    icon: BarChart3,
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600"
  }
];

const Home = () => {
  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#f8f9fb]">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-1 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-6 border border-emerald-100">
                <Leaf className="w-4 h-4" />
                Prediksi Cerdas untuk Rumah Anda
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Prediksi Konsumsi Listrik, <span className="text-emerald-600">Hemat Energi,</span> Hidup Lebih Cerdas
              </h1>
              
              <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
                Masukkan data perangkat elektronik rumah Anda, dan sistem kami akan memprediksi konsumsi listrik bulanan serta memberikan rekomendasi efisiensi energi yang dipersonalisasi.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Link
                  to="/predict"
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
                      <h3 className="font-bold text-gray-900">Selamat datang, Pengguna!</h3>
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

      {/* WHY US SECTION */}
      <section className="py-24 bg-white" id="fitur">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Kenapa Memilih <span className="text-emerald-600">WattSmart?</span>
            </h2>
            <p className="text-gray-500 text-lg">
              Solusi prediksi dan efisiensi energi yang dirancang untuk kebutuhan rumah tangga modern.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${feature.bgColor} ${feature.iconColor}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
