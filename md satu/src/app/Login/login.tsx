"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import bgLogin from "../assets/images/LoginImage.png";

export default function LoginPage() {
  const [tab, setTab]           = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({ email: "", password: "", nama: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">

      {/* ── Kiri: Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[380px]">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="font-syne font-bold text-gray-900 text-xl">WattSmart</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="font-syne text-[26px] font-bold text-gray-900 leading-tight">
              {tab === "login" ? "Selamat datang\nkembali 👋" : "Buat akun baru"}
            </h1>
            <p className="text-[13px] text-gray-400 mt-2 leading-relaxed">
              {tab === "login"
                ? "Masuk untuk melihat riwayat dan hasil prediksi Anda"
                : "Daftar gratis dan mulai prediksi konsumsi listrik Anda"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-semibold font-syne rounded-lg transition-all duration-200 ${
                  tab === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nama — hanya register */}
            {tab === "register" && (
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[15px] h-[15px]">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={set("nama")}
                    placeholder="Nama Anda"
                    required={tab === "register"}
                    className="input-field pl-10 h-11 text-[13px]"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-gray-700">
                Alamat Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[15px] h-[15px]">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 7l10 7 10-7" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="email@contoh.com"
                  required
                  className="input-field pl-10 h-11 text-[13px]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-gray-700">
                  Kata Sandi
                </label>
                {tab === "login" && (
                  <a href="#" className="text-[12px] text-emerald-600 hover:text-emerald-700 font-medium">
                    Lupa kata sandi?
                  </a>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[15px] h-[15px]">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
                  className="input-field pl-10 pr-11 h-11 text-[13px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[15px] h-[15px]">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[15px] h-[15px]">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {tab === "register" && (
                <p className="text-[11px] text-gray-400">
                  Minimal 8 karakter, kombinasi huruf dan angka.
                </p>
              )}
            </div>

            {/* Syarat — hanya register */}
            {tab === "register" && (
              <div className="flex items-start gap-2.5 pt-0.5">
                <input
                  type="checkbox"
                  id="syarat"
                  required
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-emerald-500 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="syarat" className="text-[12px] text-gray-500 leading-relaxed cursor-pointer">
                  Saya menyetujui{" "}
                  <a href="#" className="text-emerald-600 hover:underline font-semibold">
                    Syarat & Ketentuan
                  </a>
                  {" "}dan{" "}
                  <a href="#" className="text-emerald-600 hover:underline font-semibold">
                    Kebijakan Privasi
                  </a>
                </label>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 mt-2 text-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {tab === "login" ? "Masuk..." : "Mendaftar..."}
                </>
              ) : (
                tab === "login" ? "Masuk ke Akun" : "Buat Akun Gratis"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[12px] text-gray-400">atau lanjutkan tanpa akun</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Guest */}
          <Link
            href="/Input"
            className="btn-secondary w-full h-11 text-[13px]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Langsung Prediksi Tanpa Akun
          </Link>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
            <Link
              href="/Home"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-[12px] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>

        </div>
      </div>

      {/* ── Kanan: Gambar ── */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src={bgLogin}
          alt="Ilustrasi rumah pintar hemat energi"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

    </div>
  );
}