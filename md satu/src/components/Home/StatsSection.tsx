"use client";

export function StatsSection() {
  const stats = [
    { value: "94.2%", label: "Akurasi Prediksi",     sub: "Regresi Linear Berganda" },
    { value: "10K+",  label: "Data Training",         sub: "Rumah tangga Indonesia" },
    { value: "30%",   label: "Rata-rata Penghematan", sub: "Dengan rekomendasi kami" },
    { value: "< 1s",  label: "Waktu Prediksi",        sub: "Hasil instan real-time" },
  ];

  return (
    <section className="py-14 bg-gray-50 border-y border-gray-100">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-4 gap-8 divide-x divide-gray-200">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <p className="font-syne text-4xl font-extrabold text-emerald-500 mb-1">
                {stat.value}
              </p>
              <p className="text-gray-800 font-semibold text-sm">{stat.label}</p>
              <p className="text-gray-400 text-xs mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}