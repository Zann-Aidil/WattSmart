"use client";

const benefits = [
  {
    icon: "⚡", title: "Prediksi Akurat",
    description: "Model regresi linear berganda dilatih pada ribuan data rumah tangga Indonesia menghasilkan prediksi yang sangat akurat.",
    accent: "#10b981", bg: "#f0fdf4", border: "#bbf7d0",
  },
  {
    icon: "💡", title: "Rekomendasi Cerdas",
    description: "Saran efisiensi energi yang dipersonalisasi berdasarkan pola konsumsi unik rumah Anda.",
    accent: "#f59e0b", bg: "#fffbeb", border: "#fde68a",
  },
  {
    icon: "📊", title: "Visualisasi Lengkap",
    description: "Grafik interaktif menampilkan breakdown konsumsi per perangkat, tren bulanan, dan perbandingan efisiensi.",
    accent: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe",
  },
  {
    icon: "💰", title: "Hemat Tagihan",
    description: "Ketahui estimasi tagihan listrik bulanan dan potensi penghematan yang bisa Anda raih.",
    accent: "#ec4899", bg: "#fdf2f8", border: "#fbcfe8",
  },
  {
    icon: "🔍", title: "Deteksi Perangkat Boros",
    description: "Identifikasi perangkat elektronik mana yang paling banyak mengonsumsi listrik di rumah Anda.",
    accent: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe",
  },
  {
    icon: "📱", title: "Mudah Digunakan",
    description: "Antarmuka intuitif memungkinkan siapa saja memasukkan data dan mendapatkan prediksi dalam hitungan detik.",
    accent: "#06b6d4", bg: "#ecfeff", border: "#a5f3fc",
  },
];

export function BenefitCards() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Kenapa WattSmart?</p>
          <h2 className="font-syne text-4xl font-bold text-gray-900 mb-4">
            Manfaat Menggunakan Sistem Ini
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
            Dari prediksi hingga rekomendasi, semua yang Anda butuhkan untuk mengelola
            konsumsi listrik rumah tangga ada di sini.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default"
              style={{ background: b.bg, borderColor: b.border }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: b.accent + "18" }}
              >
                {b.icon}
              </div>
              <h3 className="font-syne font-bold text-gray-900 text-base mb-2">{b.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}