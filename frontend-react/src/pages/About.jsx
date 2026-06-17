import React from 'react';
import { Info, Users, ShieldCheck, Zap } from 'lucide-react';

const About = () => {
  return (
    <div className="w-full max-w-4xl mx-auto pb-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
          <Info size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tentang WattSmart</h2>
          <p className="text-sm text-gray-500">Misi kami dan teknologi di baliknya</p>
        </div>
      </div>

      <div className="card mb-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none p-8 md:p-12">
        <div className="max-w-2xl">
          <h3 className="text-3xl font-bold mb-4 font-outfit">Masa Depan Energi yang Lebih Cerdas</h3>
          <p className="text-emerald-50 text-lg leading-relaxed mb-8">
            WattSmart adalah platform prediktif bertenaga AI yang membantu rumah tangga 
            dan UKM memahami, merencanakan, dan mengoptimalkan konsumsi listrik mereka.
            Kami percaya bahwa efisiensi energi dimulai dari kesadaran data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Zap size={24} fill="currentColor" />
          </div>
          <h4 className="font-bold text-lg mb-2">Machine Learning</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            Didukung oleh algoritma XGBoost tingkat lanjut, model kami dilatih dengan 
            ribuan data historis untuk memberikan prediksi dengan akurasi tinggi hingga 94.2%.
          </p>
        </div>
        
        <div className="card">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h4 className="font-bold text-lg mb-2">Fokus Pengguna</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            Tidak hanya memberikan angka prediksi, kami memberikan rekomendasi langkah-langkah 
            nyata yang bisa dilakukan secara personal berdasarkan input dari setiap pengguna.
          </p>
        </div>

        <div className="card">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h4 className="font-bold text-lg mb-2">Privasi Data</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            Integritas dan privasi data pengguna adalah prioritas utama. Riwayat 
            prediksi Anda dienkripsi dan diamankan secara terpusat.
          </p>
        </div>
      </div>

      <div className="card">
        <h4 className="font-bold text-lg mb-4 text-gray-900">Tentang Proyek Ini</h4>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Aplikasi ini dibangun sebagai bagian dari proyek Capstone untuk program 
          pengembangan keterampilan teknologi yang mengintegrasikan Artificial Intelligence 
          (Machine Learning) dengan Web Development (React + FastAPI).
        </p>
        <p className="text-gray-600 text-sm leading-relaxed">
          Semua metrik dan nilai prediksi yang dihasilkan berasal dari model yang dikembangkan
          menggunakan Python scikit-learn & xgboost, di-*deploy* sebagai API mikroservis 
          yang cepat dan skalabel.
        </p>
      </div>
    </div>
  );
};

export default About;
