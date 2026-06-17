"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Zap, 
  BarChart2, 
  Lightbulb, 
  MonitorSmartphone, 
  History, 
  FileText, 
  Settings 
} from "lucide-react";
import { Logo } from "../shared/Logo";

const navItems = [
  { name: "Beranda", href: "/dashboard/beranda", icon: Home },
  { name: "Prediksi", href: "/dashboard/prediksi", icon: Zap },
  { name: "Hasil", href: "/dashboard/hasil", icon: BarChart2 },
  { name: "Rekomendasi", href: "/dashboard/rekomendasi", icon: Lightbulb },
];

const secondaryNavItems = [
  { name: "Perangkat", href: "/dashboard/perangkat", icon: MonitorSmartphone },
  { name: "Riwayat", href: "/dashboard/riwayat", icon: History },
  { name: "Laporan", href: "/dashboard/laporan", icon: FileText },
  { name: "Pengaturan", href: "/dashboard/pengaturan", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 hidden lg:flex flex-col h-screen sticky top-0 overflow-y-auto pt-6">
      <div className="px-4 mb-4 mt-2">
        <Logo className="scale-90 origin-left" />
      </div>

      <nav className="flex-1 px-4 space-y-8">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          {secondaryNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Ad/Promo Area as per mockup */}
      <div className="p-4 mt-auto mb-6">
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <h4 className="font-bold text-emerald-800 text-sm mb-1">Hemat Energi, Hemat Biaya</h4>
          <p className="text-xs text-emerald-600 mb-4">Kelola penggunaan listrik dengan lebih cerdas setiap hari.</p>
          
          <div className="w-full h-24 bg-white rounded-lg mb-4 flex items-end justify-center pb-2 relative overflow-hidden">
             {/* Simple illustration representation */}
             <div className="absolute bottom-0 w-full h-8 bg-emerald-100"></div>
             <Home className="h-12 w-12 text-emerald-600 relative z-10" />
             <Zap className="h-4 w-4 text-emerald-400 absolute top-4 right-4 animate-pulse" />
          </div>

          <button className="w-full py-2 bg-white text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors">
            Pelajari Cara Hemat &rarr;
          </button>
        </div>
      </div>
    </aside>
  );
}
