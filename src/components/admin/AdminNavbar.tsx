'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  ChefHat, 
  UtensilsCrossed, 
  LayoutGrid, 
  Users, 
  Tablet, 
  ExternalLink,
  Volume2
} from 'lucide-react';
import { playOrderChime, playTapSound } from '@/lib/sound';
import { DataService } from '@/lib/data-service';

export const AdminNavbar: React.FC = () => {
  const pathname = usePathname();
  const [serverCallCount, setServerCallCount] = useState(0);
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  const syncBadges = async () => {
    DataService.initData();
    const [tables, orders] = await Promise.all([
      DataService.getTables(),
      DataService.getOrders(),
    ]);
    const calls = tables.filter((t) => t.status === 'serveur_appele').length;
    const active = orders.filter((o) => o.status !== 'servie' && o.status !== 'annulee').length;
    setServerCallCount(calls);
    setActiveOrderCount(active);
  };

  useEffect(() => {
    syncBadges();
    const unsubscribe = DataService.subscribe(() => {
      syncBadges();
    });
    return () => unsubscribe();
  }, []);

  const navLinks = [
    { 
      href: '/admin', 
      label: 'Tableau de Bord', 
      shortLabel: 'Accueil', 
      icon: LayoutDashboard,
      badge: null,
    },
    { 
      href: '/admin/cuisine', 
      label: 'Cuisine KDS', 
      shortLabel: 'Cuisine', 
      icon: ChefHat,
      badge: activeOrderCount > 0 ? { count: activeOrderCount, isAlert: false } : null,
    },
    { 
      href: '/admin/menu', 
      label: 'Gestion du Menu', 
      shortLabel: 'Menu', 
      icon: UtensilsCrossed,
      badge: null,
    },
    { 
      href: '/admin/tables', 
      label: 'Tables & Tablettes', 
      shortLabel: 'Tables', 
      icon: LayoutGrid,
      badge: serverCallCount > 0 ? { count: serverCallCount, isAlert: true } : null,
    },
    { 
      href: '/admin/customers', 
      label: 'Clients CRM', 
      shortLabel: 'Clients', 
      icon: Users,
      badge: null,
    },
  ];

  return (
    <header className="bg-[#0D121B]/90 backdrop-blur-xl border-b border-white/[0.08] select-none flex flex-col shrink-0 z-40 shadow-2xl">
      {/* Main Top Header Bar */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Mode with Official Logo */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link 
            href="/admin" 
            onClick={playTapSound}
            className="relative h-8 sm:h-9 w-28 sm:w-36 flex items-center shrink-0 transition-opacity hover:opacity-90 active:scale-95"
            title="MAT HOUSE RESTAURANT - Console Admin"
          >
            <Image
              src="/logo.png"
              alt="Mat House Restaurant"
              fill
              className="object-contain object-left filter drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]"
              priority
            />
          </Link>

          <div className="h-4 w-px bg-white/10 hidden 2xl:block" />

          <span className="hidden 2xl:inline-flex items-center gap-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            Console d&apos;Administration
          </span>
        </div>

        {/* Center Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#131B29]/80 p-1 rounded-2xl border border-white/[0.06] shrink-0">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={playTapSound}
                className={`px-2.5 lg:px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 relative whitespace-nowrap ${
                  isActive
                    ? 'bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/30 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#1A2333]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#E5C158]' : 'text-slate-400'}`} />
                <span className="hidden xl:inline">{item.label}</span>
                <span className="inline xl:hidden">{item.shortLabel}</span>

                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold leading-none ${
                    item.badge.isAlert 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-[#D4AF37] text-[#0B0E14]'
                  }`}>
                    {item.badge.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <button
            onClick={() => {
              playTapSound();
              playOrderChime();
            }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap"
            title="Tester le carillon sonore"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="hidden sm:inline">Carillon</span>
          </button>

          <Link
            href="/"
            target="_blank"
            onClick={playTapSound}
            className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0E14] text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 shadow-sm whitespace-nowrap shrink-0"
            title="Ouvrir le Kiosque Tablette Client"
          >
            <Tablet className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Mode Kiosque</span>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
          </Link>
        </div>
      </div>

      {/* Mobile Navigation Bar (< md) */}
      <nav className="md:hidden border-t border-white/[0.08] bg-[#0A0E17] px-2 py-1.5 grid grid-cols-5 gap-1">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={playTapSound}
              className={`py-1.5 px-1 rounded-xl text-[10px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                isActive
                  ? 'bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E5C158]' : 'text-slate-400'}`} />
              <span className="truncate tracking-tight">{item.shortLabel}</span>

              {item.badge && (
                <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[9px] font-mono font-bold flex items-center justify-center ${
                  item.badge.isAlert ? 'bg-rose-500 text-white' : 'bg-[#D4AF37] text-[#0B0E14]'
                }`}>
                  {item.badge.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
