import React from 'react';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { AdminAuthGate } from '@/components/admin/AdminAuthGate';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <div className="admin-theme w-full h-screen flex flex-col md:flex-row bg-[#F5F6F8] text-slate-900 overflow-hidden select-text">
        <AdminNavbar />
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </AdminAuthGate>
  );
}
