"use client";

import Link from "next/link";

const steps = [
  {
    number: "01", icon: "📋", title: "Input Data Rumah",
    description: "Masukkan luas rumah, jumlah penghuni, dan daftar perangkat elektronik beserta durasi penggunaan hariannya.",
    href: "/Input",
  },
  {
    number: "02", icon: "🤖", title: "Proses ML",
    description: "Algoritma regresi linear berganda memproses data menggunakan model yang telah dilatih pada 10.000+ data rumah tangga nyata.",
    href: null,
  },
  {
    number: "03", icon: "📊", title: "Hasil Prediksi",
    description: "Dapatkan estimasi kWh, perkiraan tagihan, grafik breakdown per perangkat, dan level efisiensi energi rumah Anda.",
    href: "/Result",
  },
  {
    number: "04", icon: "💡", title: "Rekomendasi",
    description: "Terima saran efisiensi energi yang dipersonalisasi: perangkat mana yang perlu dioptimalkan dan tips praktis penghematan.",
    href: "/Recommendations",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Alur Penggunaan</p>
          <h2 className="font-syne text-4xl font-bold text-gray-900 mb-4">Cara Kerja WattSmart</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
            Empat langkah sederhana dari input data hingga rekomendasi efisiensi energi.
          </p>
        </div>

        <div className="relative">
          {/* Connector */}
          <div className="absolute top-12 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-px bg-gray-200 hidden md:block" />

          <div className="grid grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.number} className="flex flex-col items-center text-center group">
                <div className="relative mb-5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${
                      i === 0
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-400 shadow-sm">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-syne font-bold text-gray-900 text-sm mb-2">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.description}</p>

                {step.href && (
                  <a href={step.href} className="mt-3 text-emerald-600 text-xs font-medium hover:underline underline-offset-2">
                    Ke halaman →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-14">
          <Link
            href="/Input"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-syne font-bold transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Mulai Sekarang — Gratis
          </Link>
        </div>
      </div>
    </section>
  );
}