"use client";

import Link from "next/link";

export function CTABanner() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden p-12 text-center border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-200 opacity-30 blur-[60px] pointer-events-none" />

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 mb-6">
            <svg viewBox="0 0 24 24" fill="#10b981" className="w-8 h-8">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>

          <h2 className="font-syne text-4xl font-bold text-gray-900 mb-4">
            Siap Menghemat Listrik?
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed mb-8">
            Ribuan rumah tangga sudah menggunakan WattSmart untuk memantau dan mengoptimalkan
            konsumsi listrik mereka. Bergabunglah sekarang, gratis.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/Input"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-syne font-bold transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Mulai Prediksi Gratis
            </Link>
            <Link
              href="/History"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium transition-all"
            >
              Lihat Riwayat
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-8">
            {["✓ Tidak perlu daftar", "✓ Hasil langsung", "✓ Data tersimpan otomatis"].map((text) => (
              <span key={text} className="text-xs text-gray-400 font-medium">{text}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}