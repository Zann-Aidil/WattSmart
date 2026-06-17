"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Zap } from "lucide-react";
import { Logo } from "@/src/components/shared/Logo";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/Home", label: "Beranda" },
  { href: "/Input", label: "Prediksi" },
  { href: "/Result", label: "Hasil" },
  { href: "/Recommendations", label: "Rekomendasi" },
  { href: "#fitur", label: "Fitur" },
  { href: "#tentang-kami", label: "Tentang Kami" },
];

export function LandingNavbar() {
  const pathname = usePathname();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/Home" className="flex-shrink-0">
          <Logo />
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href === '/Home' && pathname === '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all duration-200 border-b-2 py-7 ${
                  isActive
                    ? "text-emerald-600 border-emerald-500"
                    : "text-gray-600 border-transparent hover:text-emerald-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
            <Sun className="w-5 h-5" />
          </button>
          <Link
            href="/Login"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all duration-200"
          >
            Masuk
          </Link>
          <Link
            href="/Input"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200"
          >
            <Zap className="w-4 h-4 fill-current" />
            Mulai Prediksi
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
