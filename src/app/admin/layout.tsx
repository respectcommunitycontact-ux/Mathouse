import React from 'react';
import { AdminNavbar } from '@/components/admin/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full min-h-screen bg-[#0B1017] text-white flex flex-col overflow-hidden">
      {/* ATMOSPHERIC RESTAURANT BACKGROUND (BEHIND ENTIRE ADMIN PANEL) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.28] contrast-[1.12] scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        {/* Layered dark gradients for high contrast & luxury restaurant atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#0B0E14]/85 to-[#0B0E14]/90" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0B0E14]/50 to-[#0B0E14]/95" />
        {/* Warm golden light bloom */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />
      </div>

      <AdminNavbar />
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
