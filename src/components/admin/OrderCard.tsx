'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { Clock, ArrowRight, CheckCheck, RotateCcw, AlertTriangle } from 'lucide-react';
import { playTapSound } from '@/lib/sound';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus }) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const created = new Date(order.created_at).getTime();
      const now = Date.now();
      const diffMin = Math.floor((now - created) / (1000 * 60));
      setElapsedMinutes(Math.max(0, diffMin));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 30000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  // Group items by person
  const groupedItems = order.items.reduce<Record<string, typeof order.items>>((acc, it) => {
    const label = it.person_label || 'Toute la table';
    if (!acc[label]) acc[label] = [];
    acc[label].push(it);
    return acc;
  }, {});

  // Status color badge
  const getElapsedBadgeColor = () => {
    if (elapsedMinutes > 20) return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    if (elapsedMinutes > 10) return 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30';
    return 'bg-white/5 text-slate-300 border-white/10';
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', order.id);
  };

  const formattedElapsed = elapsedMinutes === 0 
    ? 'À l\'instant' 
    : elapsedMinutes > 60 
      ? `+${Math.floor(elapsedMinutes / 60)}h` 
      : `${elapsedMinutes} min`;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-[#0E131B] rounded-2xl border border-white/10 hover:border-[#D4AF37]/40 shadow-xl transition-all duration-200 overflow-hidden cursor-grab active:cursor-grabbing flex flex-col justify-between"
    >
      {/* 1. Header: Table, Convives, Order #, Time */}
      <div className="bg-[#141C28] p-3.5 border-b border-white/[0.08] flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#0B1017] font-mono font-black text-sm uppercase tracking-wider shadow-gold-subtle flex-shrink-0">
            TABLE {order.table_number}
          </span>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <span>{order.customer?.full_name || 'Client'}</span>
              <span className="text-slate-400 font-normal">&bull;</span>
              <span className="text-slate-400 font-normal">
                {order.people_count} {order.people_count === 1 ? 'pers' : 'pers'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#D4AF37] font-semibold">
              {order.order_number}
            </span>
          </div>
        </div>

        {/* Elapsed Time Badge */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 font-mono flex-shrink-0 ${getElapsedBadgeColor()}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{formattedElapsed}</span>
        </div>
      </div>

      {/* 2. Simplified Dish List (No internal scrollbar, Clean and Legible) */}
      <div className="p-4 space-y-3 flex-1">
        {Object.entries(groupedItems).map(([personLabel, items]) => (
          <div key={personLabel} className="space-y-2">
            {/* Person Group Subheader (only if multiple groups) */}
            {Object.keys(groupedItems).length > 1 && (
              <div className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5 pt-1 border-t border-white/[0.06] first:border-none first:pt-0">
                <span>{personLabel === 'Toute la table' ? '🍽️' : '👤'}</span>
                <span>{personLabel}</span>
              </div>
            )}

            {/* Dishes */}
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="flex items-start gap-2.5 flex-1">
                    <span className="font-black font-mono text-sm text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      {it.quantity}x
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-white leading-snug">
                        {it.item_name}
                      </p>
                      {it.special_instructions && (
                        <p className="text-xs text-amber-300 font-medium italic mt-0.5 flex items-center gap-1">
                          <span className="text-amber-400 font-bold">&bull;</span>
                          <span>{it.special_instructions}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-mono flex-shrink-0 pt-0.5">
                    {(it.item_price * it.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Chef General Note */}
        {order.notes && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>Note Chef : {order.notes}</span>
          </div>
        )}
      </div>

      {/* 3. Footer: Total & Single Large Action Button */}
      <div className="p-3.5 bg-[#080C12] border-t border-white/[0.08] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Total Table</span>
          <span className="text-base font-black font-mono text-[#D4AF37]">
            {order.total.toFixed(2)} €
          </span>
        </div>

        {/* Single Fast Action Pill */}
        <div>
          {order.status !== 'servie' ? (
            <button
              onClick={() => {
                playTapSound();
                onUpdateStatus(order.id, 'servie');
              }}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 sm:gap-2 transition active:scale-95 border border-emerald-400/40 shrink-0"
              title="Marquer comme servie"
            >
              <CheckCheck className="w-4 h-4 text-white" />
              <span>Marquer Servie</span>
            </button>
          ) : (
            <button
              onClick={() => {
                playTapSound();
                onUpdateStatus(order.id, 'nouvelle');
              }}
              className="px-3.5 py-1.5 sm:py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition border border-white/10 active:scale-95 shrink-0"
              title="Remettre dans les nouvelles commandes"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Remettre en cours</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
