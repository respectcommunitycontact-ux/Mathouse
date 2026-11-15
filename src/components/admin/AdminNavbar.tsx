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
  Volume2,
  LogOut,
  QrCode,
} from 'lucide-react';
import { playOrderChime, playTapSound } from '@/lib/sound';
import { DataService } from '@/lib/data-service';
import { InstallAppButton } from '@/components/InstallAppButton';
import { useAdminAuth } from './AdminAuthGate';

export const AdminNavbar: React.FC = () => {
  const pathname = usePathname();
  const { email, signOut } = useAdminAuth();
  const [serverCallCount, setServerCallCount] = useState(0);
  const [billCount, setBillCount] = useState(0);
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  useEffect(() => {
    const syncBadges = async () => {
      DataService.initData();
      const [tables, orders] = await Promise.all([DataService.getTables(), DataService.getOrders()]);
      setServerCallCount(tables.filter((t) => t.status === 'serveur_appele').length);
      setBillCount(tables.filter((t) => t.status === 'addition_demandee').length);
      setActiveOrderCount(orders.filter((o) => o.status !== 'servie' && o.status !== 'annulee').length);
    };
    syncBadges();
    const unsubscribe = DataService.subscribe(() => {
      syncBadges();
    });
    return () => unsubscribe();
  }, []);

  const tableAlerts = serverCallCount + billCount;

  const navLinks = [
    {
      href: '/admin',
      label: 'Vue d’ensemble',
      shortLabel: 'Accueil',
      hint: 'Le service en un coup d’œil',
      icon: LayoutDashboard,
      badge: null as null | { count: number; alert: boolean },
    },
    {
      href: '/admin/cuisine',
      label: 'Commandes',
      shortLabel: 'Commandes',
      hint: 'À préparer et à servir',
      icon: ChefHat,
      badge: activeOrderCount > 0 ? { count: activeOrderCount, alert: false } : null,
    },
    {
      href: '/admin/tables',
      label: 'Salle & chambres',
      shortLabel: 'Salle',
      hint: 'Appels serveur et additions',
      icon: LayoutGrid,
      badge: tableAlerts > 0 ? { count: tableAlerts, alert: true } : null,
    },
    {
      href: '/admin/menu',
      label: 'Carte & stocks',
      shortLabel: 'Carte',
      hint: 'Plats, prix et ruptures',
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      href: '/admin/qr-codes',
      label: 'QR codes',
      shortLabel: 'QR',
      hint: 'Chambres et appartements',
      icon: QrCode,
      badge: null,
    },
    {
      href: '/admin/customers',
      label: 'Clients',
      shortLabel: 'Clients',
      hint: 'Contacts WhatsApp',
      icon: Users,
      badge: null,
    },
  ];

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href));

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className="hidden md:flex w-60 lg:w-64 shrink-0 flex-col bg-[#14171F] text-slate-300 border-r border-black/20">
        <Link
          href="/admin"
          onClick={playTapSound}
          className="px-5 pt-5 pb-4 block border-b border-white/[0.06]"
          title="Mat House — Administration"
        >
          <div className="relative h-9 w-40">
            <Image src="/logo.png" alt="Mat House Restaurant" fill className="object-contain object-left" priority />
          </div>
          <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Administration
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Navigation administration">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={playTapSound}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                  active ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#E85D04]" />}
                <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-[#F48C06]' : ''}`} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                  <span className="block text-[11px] text-slate-500 leading-tight mt-0.5 truncate">{item.hint}</span>
                </span>
                {item.badge && (
                  <span
                    className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      item.badge.alert ? 'bg-rose-500 text-white' : 'bg-[#E85D04] text-white'
                    }`}
                  >
                    {item.badge.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
          <Link
            href="/"
            target="_blank"
            onClick={playTapSound}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition"
            title="Ouvrir l’écran client des tablettes dans un nouvel onglet"
          >
            <Tablet className="w-[18px] h-[18px]" />
            <span className="flex-1">Voir l’écran client</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>
          <button
            onClick={() => {
              playTapSound();
              playOrderChime();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition"
            title="Jouer le son qui annonce une nouvelle commande"
          >
            <Volume2 className="w-[18px] h-[18px]" />
            <span>Tester le son</span>
          </button>
          <InstallAppButton variant="sidebar" />
          {email && (
            <div className="mt-2 pt-3 border-t border-white/[0.06]">
              <p className="px-3 text-[11px] text-slate-500 truncate" title={email}>
                Connecté : {email}
              </p>
              <button
                onClick={signOut}
                className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top bar + bottom tabs */}
      <header className="md:hidden shrink-0 bg-[#14171F] px-4 h-14 flex items-center justify-between">
        <div className="relative h-8 w-32">
          <Image src="/logo.png" alt="Mat House Restaurant" fill className="object-contain object-left" priority />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 px-3 h-8 rounded-lg bg-white/10"
          >
            <Tablet className="w-3.5 h-3.5" /> Écran client
          </Link>
          {email && (
            <button
              onClick={signOut}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-slate-200"
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 grid grid-cols-6 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]"
        aria-label="Navigation administration"
      >
        {navLinks.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={playTapSound}
              aria-current={active ? 'page' : undefined}
              className={`relative py-2 flex flex-col items-center gap-0.5 text-[11px] font-semibold ${
                active ? 'text-[#E85D04]' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.shortLabel}</span>
              {item.badge && (
                <span
                  className={`absolute top-1 right-[22%] min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center ${
                    item.badge.alert ? 'bg-rose-500' : 'bg-[#E85D04]'
                  }`}
                >
                  {item.badge.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
};
