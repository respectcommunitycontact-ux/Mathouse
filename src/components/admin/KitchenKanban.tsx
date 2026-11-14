'use client';

import React, { useEffect, useState } from 'react';
import { useKitchenStore } from '@/store/kitchenStore';
import { OrderCard } from './OrderCard';
import { Order, OrderStatus } from '@/types';
import { 
  Sparkles, 
  CheckCircle, 
  Search, 
  RefreshCw 
} from 'lucide-react';
import { playTapSound } from '@/lib/sound';

export const KitchenKanban: React.FC = () => {
  const { orders, isLoading, fetchOrders, updateStatus, initRealtime } = useKitchenStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMobileColumn, setActiveMobileColumn] = useState<'nouvelle' | 'servie'>('nouvelle');

  useEffect(() => {
    const unsubscribe = initRealtime();
    return () => unsubscribe();
  }, [initRealtime]);

  // Filter orders by search query
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchesTable = `table ${o.table_number}`.includes(q) || String(o.table_number) === q;
    const matchesNumber = o.order_number.toLowerCase().includes(q);
    const matchesCustomer = o.customer?.full_name.toLowerCase().includes(q) || o.customer?.whatsapp.includes(q);
    return matchesTable || matchesNumber || matchesCustomer;
  });

  const columns: { 
    id: 'nouvelle' | 'servie'; 
    title: string; 
    shortTitle: string;
    subtitle: string; 
    icon: React.ReactNode; 
    iconBg: string;
    filter: (order: Order) => boolean;
    getBadgeStyle: (count: number) => string;
  }[] = [
    {
      id: 'nouvelle',
      title: 'Nouvelles Commandes',
      shortTitle: 'Nouvelles',
      subtitle: 'À préparer et envoyer en salle',
      icon: <Sparkles className="w-4 h-4 text-[#D4AF37]" />,
      iconBg: 'bg-[#D4AF37]/15 border-[#D4AF37]/30 text-[#D4AF37]',
      filter: (o) => o.status !== 'servie' && o.status !== 'annulee',
      getBadgeStyle: (count) => count > 0 
        ? 'bg-[#D4AF37] text-[#0B1017] shadow-[0_2px_8px_rgba(212,175,55,0.45)]' 
        : 'bg-white/5 text-slate-500 border border-white/10',
    },
    {
      id: 'servie',
      title: 'Commandes Servies',
      shortTitle: 'Servies',
      subtitle: 'Livrées aux clients en salle',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      filter: (o) => o.status === 'servie',
      getBadgeStyle: (count) => count > 0 
        ? 'bg-emerald-400 text-[#0B1017] shadow-[0_2px_8px_rgba(52,211,153,0.4)]' 
        : 'bg-white/5 text-slate-500 border border-white/10',
    },
  ];

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent, targetStatus: 'nouvelle' | 'servie') => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) {
      playTapSound();
      updateStatus(orderId, targetStatus);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const activeCount = orders.filter((o) => o.status !== 'servie' && o.status !== 'annulee').length;
  const servedCount = orders.filter((o) => o.status === 'servie').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0E14]/75 backdrop-blur-sm select-none overflow-hidden text-slate-100">
      {/* Kanban Sub-Header & Search Controls */}
      <div className="glass-panel border-b border-[#D4AF37]/20 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 shadow-lg">
        <div className="flex items-center justify-between sm:justify-start space-x-4">
          <div className="flex items-center space-x-2.5 text-xs font-extrabold text-[#D4AF37] uppercase tracking-widest">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
            <span>KDS &bull; FLUX CUISINE DIRECT</span>
          </div>

          <button
            onClick={() => {
              playTapSound();
              fetchOrders();
            }}
            className="p-2 rounded-full bg-[#121824] hover:bg-[#1A2234] text-slate-300 border border-white/15 hover:text-white transition-all active:scale-95 shadow-md"
            title="Rafraîchir les commandes"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>
        </div>

        {/* Search & Stats Summary */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
            <input
              type="text"
              placeholder="Rechercher Table, Client, #CMD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-[#0B0E14] border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] transition-all"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2.5 text-xs">
            <span className="px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/40 font-extrabold whitespace-nowrap shadow-gold-subtle">
              {activeCount} à préparer
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-extrabold whitespace-nowrap">
              {servedCount} servies
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Column Segmented Switcher (< md) */}
      <div className="md:hidden px-3 pt-2.5 pb-2.5 grid grid-cols-2 gap-2 bg-[#0E1420] border-b border-white/10 shrink-0">
        {columns.map((col) => {
          const count = filteredOrders.filter(col.filter).length;
          const isActive = activeMobileColumn === col.id;
          return (
            <button
              key={col.id}
              onClick={() => {
                playTapSound();
                setActiveMobileColumn(col.id);
              }}
              className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0B0E14] shadow-gold-subtle font-extrabold'
                  : 'bg-[#121824] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <span>{col.title}</span>
              <span className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center font-extrabold ${
                isActive ? 'bg-[#0B0E14] text-[#D4AF37]' : 'bg-white/10 text-white'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Single Column View (< md) */}
      <div className="md:hidden flex-1 p-3 overflow-y-auto custom-scrollbar">
        {(() => {
          const activeCol = columns.find((c) => c.id === activeMobileColumn) || columns[0];
          const colOrders = filteredOrders.filter(activeCol.filter);

          return (
            <div className="flex flex-col bg-[#121824] rounded-3xl border border-white/10 p-4 shadow-2xl min-h-full">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.08] gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${activeCol.iconBg}`}>
                    {activeCol.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white tracking-wide truncate">{activeCol.title}</h3>
                    <span className="text-[11px] text-slate-400 block font-light truncate">{activeCol.subtitle}</span>
                  </div>
                </div>

                <span className={`min-w-[28px] h-7 px-2.5 rounded-full font-mono font-extrabold text-xs flex items-center justify-center shrink-0 ${activeCol.getBadgeStyle(colOrders.length)}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Orders List */}
              <div className="space-y-4 flex-1">
                {colOrders.length === 0 ? (
                  <div className="py-16 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-xs bg-white/[0.01]">
                    <span className="font-semibold text-slate-400">Aucune commande dans cette section</span>
                    <span className="text-[11px] text-slate-500 mt-1">En attente des convives en salle</span>
                  </div>
                ) : (
                  colOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={updateStatus}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Desktop 2-Column Kanban Board (>= md) */}
      <div className="hidden md:flex flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="grid grid-cols-2 gap-5 lg:gap-8 h-full w-full">
          {columns.map((col) => {
            const colOrders = filteredOrders.filter(col.filter);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="flex flex-col bg-[#121824] rounded-3xl border border-[#D4AF37]/20 p-5 lg:p-6 overflow-hidden h-full shadow-2xl"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08] gap-3">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-md ${col.iconBg}`}>
                      {col.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-serif font-bold text-white tracking-wide truncate">{col.title}</h3>
                      <span className="text-xs text-slate-400 block font-light mt-0.5 truncate">{col.subtitle}</span>
                    </div>
                  </div>

                  <span className={`min-w-[32px] h-8 px-3 rounded-full font-mono font-extrabold text-xs flex items-center justify-center shrink-0 transition-all ${col.getBadgeStyle(colOrders.length)}`}>
                    {colOrders.length}
                  </span>
                </div>

                {/* Orders List Container */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 custom-scrollbar">
                  {colOrders.length === 0 ? (
                    <div className="h-52 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-xs bg-white/[0.01]">
                      <span className="font-semibold text-slate-400">Aucune commande {col.title.toLowerCase()}</span>
                      <span className="text-[11px] text-slate-500 mt-1">Les nouvelles commandes s&apos;afficheront automatiquement ici</span>
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={updateStatus}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
