"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 bg-white">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#10b981 1px, transparent 1px),
            linear-gradient(90deg, #10b981 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Soft glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-emerald-100 opacity-60 blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">

        {/* Headline */}
        <h1
          className="font-syne text-6xl md:text-7xl font-extrabold text-gray-900 leading-[1.05] mb-6 animate-fade-up"
          style={{ animationDelay: "0.1s", animationFillMode: "both" }}
        >
          Prediksi{" "}
          <span className="text-emerald-500">Konsumsi Listrik</span>
          <br />
          Rumah Anda
        </h1>

        {/* Subtitle */}
        <p
          className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up"
          style={{ animationDelay: "0.2s", animationFillMode: "both" }}
        >
          Masukkan data perangkat elektronik rumah Anda, dan sistem kami memprediksi
          konsumsi listrik bulanan serta memberikan rekomendasi efisiensi energi
          yang dipersonalisasi.
        </p>

        {/* CTAs */}
        <div
          className="flex items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: "0.3s", animationFillMode: "both" }}
        >
          <Link
            href="/Input"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-syne font-bold text-base transition-all duration-200 active:scale-[0.98] shadow-lg shadow-emerald-500/25"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Mulai Prediksi Sekarang
            <svg
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 font-medium text-sm transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            Pelajari Cara Kerja
          </a>
        </div>

        {/* Trust indicators */}
        <div
          className="flex items-center justify-center gap-8 mt-12 animate-fade-up"
          style={{ animationDelay: "0.4s", animationFillMode: "both" }}
        >
          {[
            { icon: "🎯", label: "Akurasi 94.2%" },
            { icon: "⚡", label: "Hasil Instan" },
            { icon: "🔒", label: "Data Aman" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-gray-400 text-sm">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-gray-300 to-transparent" />
      </div>
    </section>
  );
}
