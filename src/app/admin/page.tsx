'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataService } from '@/lib/data-service';
import { Order, TableRecord, MenuItem } from '@/types';
import { 
  ChefHat, 
  UtensilsCrossed, 
  LayoutGrid, 
  Users, 
  Bell, 
  Check, 
  TrendingUp, 
  Sparkles, 
  Volume2, 
  Tablet, 
  Search, 
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { playOrderChime, playTapSound } from '@/lib/sound';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dishSearch, setDishSearch] = useState('');

  const loadData = async () => {
    DataService.initData();
    const [fetchedOrders, fetchedTables, fetchedItems] = await Promise.all([
      DataService.getOrders(),
      DataService.getTables(),
      DataService.getMenuItems(),
    ]);
    setOrders(fetchedOrders);
    setTables(fetchedTables);
    setMenuItems(fetchedItems);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = DataService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  // Metrics
  const activeOrders = orders.filter((o) => o.status !== 'servie' && o.status !== 'annulee');
  const servedOrders = orders.filter((o) => o.status === 'servie');
  const serverCalls = tables.filter((t) => t.status === 'serveur_appele');
  const billRequests = tables.filter((t) => t.status === 'addition_demandee');
  const occupiedTables = tables.filter((t) => t.status === 'occupee');
  const freeTables = tables.filter((t) => t.status === 'libre');

  const totalRevenueToday = orders
    .filter((o) => o.status !== 'annulee')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const averageBasket = orders.length > 0 ? totalRevenueToday / orders.length : 0;

  // Handlers
  const handleResolveServerCall = async (tableNumber: number) => {
    playTapSound();
    await DataService.updateTableStatus(tableNumber, 'occupee');
    loadData();
  };

  const handleClearAllAlerts = async () => {
    playTapSound();
    for (const t of serverCalls) {
      await DataService.updateTableStatus(t.number, 'occupee');
    }
    loadData();
  };

  const handleToggleStock = async (itemId: string) => {
    playTapSound();
    await DataService.toggleMenuItemAvailability(itemId);
    loadData();
  };

  const filteredDishStock = menuItems.filter((m) => {
    if (!dishSearch) return true;
    return m.name.toLowerCase().includes(dishSearch.toLowerCase()) || m.category.toLowerCase().includes(dishSearch.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0E14]/75 backdrop-blur-sm p-4 sm:p-6 lg:p-8 select-none overflow-y-auto custom-scrollbar space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08] shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">Vue Synthétique du Service</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            Tableau de Bord
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-light">
            Surveillance en temps réel des commandes en cuisine, du parc de tablettes et des demandes d&apos;assistance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playTapSound();
              playOrderChime();
            }}
            className="px-3.5 py-2 rounded-xl bg-[#141A26] hover:bg-[#1A2232] text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-2 transition active:scale-95 shadow-sm"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Tester Carillon</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#E5C158] hover:to-[#F5E6B3] text-[#0B0E14] text-xs font-black flex items-center gap-2 transition active:scale-95 shadow-sm"
          >
            <Tablet className="w-3.5 h-3.5 text-[#0B0E14]" />
            <span>Mode Kiosque Client</span>
          </Link>
        </div>
      </div>

      {/* Critical Server Call Alert Banner (Luxury Dark Rose) */}
      {serverCalls.length > 0 && (
        <div className="bg-[#1C1217] border border-rose-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-200">
                {serverCalls.length} {serverCalls.length === 1 ? 'Table requiert l\'attention du serveur' : 'Tables requièrent l\'attention du serveur'}
              </h3>
              <p className="text-xs text-rose-300/70 mt-0.5">
                Table(s) : {serverCalls.map((t) => `Table ${t.number}`).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {serverCalls.map((t) => (
              <button
                key={t.id}
                onClick={() => handleResolveServerCall(t.number)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Acquitter Table {t.number}</span>
              </button>
            ))}
            {serverCalls.length > 1 && (
              <button
                onClick={handleClearAllAlerts}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition active:scale-95 border border-white/10"
              >
                Tout Acquitter
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards Grid (Corporate Dark Luxury) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Orders KPI */}
        <Link 
          href="/admin/cuisine"
          className="bg-[#121722] rounded-2xl border border-white/[0.08] hover:border-[#D4AF37]/40 p-5 flex flex-col justify-between transition group shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Commandes Actives</span>
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/20">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white font-mono">{activeOrders.length}</span>
            <span className="text-xs text-slate-400 group-hover:text-[#E5C158] flex items-center gap-1 transition">
              KDS <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            {servedOrders.length} commandes livrées
          </span>
        </Link>

        {/* Tables & Assistance KPI */}
        <Link 
          href="/admin/tables"
          className={`bg-[#121722] rounded-2xl border p-5 flex flex-col justify-between transition group shadow-md ${
            serverCalls.length > 0 ? 'border-rose-500/40 bg-[#171216]' : 'border-white/[0.08] hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tables Occupées</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              serverCalls.length > 0 ? 'bg-rose-500/15 text-rose-400' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white font-mono">
              {occupiedTables.length + serverCalls.length + billRequests.length} / {tables.length}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-white flex items-center gap-1 transition">
              Tables <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            {freeTables.length} disponibles &bull; {billRequests.length} addition(s)
          </span>
        </Link>

        {/* Revenue KPI */}
        <div className="bg-[#121722] rounded-2xl border border-white/[0.08] p-5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Ventes du Jour</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-[#E5C158] font-mono">
              {totalRevenueToday.toFixed(2)} €
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Panier moyen : {averageBasket.toFixed(2)} €
          </span>
        </div>

        {/* CRM Customers KPI */}
        <Link 
          href="/admin/customers"
          className="bg-[#121722] rounded-2xl border border-white/[0.08] hover:border-white/20 p-5 flex flex-col justify-between transition group shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Contacts WhatsApp</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white font-mono">{orders.length}</span>
            <span className="text-xs text-slate-400 group-hover:text-purple-300 flex items-center gap-1 transition">
              Clients <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Capturés automatiquement à la commande
          </span>
        </Link>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Live Orders & Table Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Orders Live Feed */}
          <div className="bg-[#121722] rounded-3xl border border-white/[0.08] p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-base font-serif font-bold text-white">Commandes en Préparation</h3>
              </div>
              <Link
                href="/admin/cuisine"
                className="text-xs font-bold text-[#E5C158] hover:underline flex items-center gap-1"
              >
                <span>Accéder au KDS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeOrders.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs font-light">
                Aucune commande en cours pour le moment.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {activeOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-[#0B0E14] rounded-2xl p-3.5 border border-white/[0.08] flex items-center justify-between gap-3 hover:border-white/20 transition"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#E5C158] font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-[#D4AF37]/30">
                        T{ord.table_number}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs truncate">{ord.order_number}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 font-mono">
                            {ord.items.length} article(s)
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                          Client : {ord.customer?.full_name || 'Convive'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-black text-[#E5C158] font-mono">
                        {ord.total.toFixed(2)} €
                      </span>
                      <Link
                        href="/admin/cuisine"
                        className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0E14] text-xs font-black transition active:scale-95"
                      >
                        Gérer
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Table Status Grid */}
          <div className="bg-[#121722] rounded-3xl border border-white/[0.08] p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <div className="flex items-center space-x-2.5">
                <LayoutGrid className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-base font-serif font-bold text-white">État du Parc des Tables</h3>
              </div>
              <Link
                href="/admin/tables"
                className="text-xs font-bold text-[#E5C158] hover:underline flex items-center gap-1"
              >
                <span>Voir le parc complet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {tables.map((tbl) => {
                const isAlert = tbl.status === 'serveur_appele';
                const isBill = tbl.status === 'addition_demandee';
                const isOccupied = tbl.status === 'occupee';

                return (
                  <div
                    key={tbl.id}
                    className={`rounded-2xl border p-3 flex flex-col justify-between transition ${
                      isAlert
                        ? 'bg-[#1C1217] border-rose-500/50 text-rose-200'
                        : isBill
                        ? 'bg-[#1C1912] border-[#D4AF37]/50 text-[#E5C158]'
                        : isOccupied
                        ? 'bg-[#121622] border-blue-500/30 text-blue-200'
                        : 'bg-[#0B0E14] border-white/[0.08] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Table {tbl.number}</span>
                      <span className="text-[10px] font-mono text-slate-400">{tbl.battery_level}%</span>
                    </div>

                    <div className="mt-2 text-[11px] font-semibold truncate">
                      {isAlert && <span className="text-rose-400 animate-pulse font-bold">Appel Serveur !</span>}
                      {isBill && <span className="text-[#E5C158] font-bold">Addition</span>}
                      {isOccupied && <span className="text-blue-300">En dégustation</span>}
                      {!isAlert && !isBill && !isOccupied && <span className="text-emerald-400">Disponible</span>}
                    </div>

                    {isAlert && (
                      <button
                        onClick={() => handleResolveServerCall(tbl.number)}
                        className="mt-2 w-full py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition active:scale-95"
                      >
                        Acquitter
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Sleek Stock Manager */}
        <div className="space-y-6">
          <div className="bg-[#121722] rounded-3xl border border-white/[0.08] p-5 sm:p-6 shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <div className="flex items-center space-x-2.5">
                <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-base font-serif font-bold text-white">Gestion Stock Express</h3>
              </div>
              <Link
                href="/admin/menu"
                className="text-xs font-bold text-[#E5C158] hover:underline"
              >
                Menu Complet
              </Link>
            </div>

            <p className="text-xs text-slate-400 font-light mb-4 leading-relaxed">
              Activez ou verrouillez l&apos;accès à un plat en temps réel sur les tablettes.
            </p>

            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrer un plat..."
                value={dishSearch}
                onChange={(e) => setDishSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0B0E14] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-2 flex-1 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              {filteredDishStock.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-[#0B0E14] rounded-2xl p-3 border border-white/[0.08] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{dish.name}</h4>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{dish.category} &bull; {dish.price.toFixed(2)} €</span>
                  </div>

                  {/* Sleek Toggle Button */}
                  <button
                    onClick={() => handleToggleStock(dish.id)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition shrink-0 active:scale-95 border ${
                      dish.is_available
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    {dish.is_available ? 'En Stock' : 'Rupture'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
