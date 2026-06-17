"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function DashboardLayout({ children, title, breadcrumbs }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50/50 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full h-screen overflow-hidden">
        <Topbar title={title} breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
