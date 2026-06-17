"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/Home", label: "Beranda" },
  { href: "/Input", label: "Prediksi" },
  { href: "/Result", label: "Hasil" },
  { href: "/Recommendations", label: "Rekomendasi" },
  { href: "/History", label: "Riwayat" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 border-b border-gray-100 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="font-syne font-bold text-gray-900 text-base">
            WattSmart
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Login + CTA */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link
            href="/Login"
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 transition-all duration-200"
          >
            Masuk
          </Link>
          <Link
            href="/Input"
            className="px-4 py-1.5 rounded-lg text-sm font-syne font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 active:scale-[0.97]"
          >
            Mulai Prediksi
          </Link>
        </div>
      </div>
    </nav>
  );
}
