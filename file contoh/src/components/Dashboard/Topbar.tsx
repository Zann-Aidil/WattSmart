"use client";

import { Bell, Sun, Search, Menu } from "lucide-react";
import Image from "next/image";

interface TopbarProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Topbar({ title, breadcrumbs }: TopbarProps) {
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button - hidden on desktop */}
        <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs or Title */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          {breadcrumbs ? (
            breadcrumbs.map((bc, idx) => (
              <div key={bc.label} className="flex items-center gap-2">
                <span className={idx === breadcrumbs.length - 1 ? "text-gray-900 font-semibold" : "text-gray-500"}>
                  {bc.label}
                </span>
                {idx < breadcrumbs.length - 1 && <span className="text-gray-300">›</span>}
              </div>
            ))
          ) : (
            <h1 className="text-lg font-bold text-gray-900">{title || "Dashboard"}</h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="hidden md:flex relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari sesuatu..." 
            className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <Sun className="h-5 w-5" />
          </button>
          
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center gap-3 ml-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition-colors">
            <div className="h-9 w-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold overflow-hidden border border-emerald-200">
               {/* User Avatar Placeholder */}
               FA
            </div>
            <div className="hidden md:block text-sm">
              <div className="font-bold text-gray-900 leading-tight">Fauzan Aidil</div>
              <div className="text-gray-500 text-xs">Rumah Tangga</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
