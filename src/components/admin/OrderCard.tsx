'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { Clock, CheckCheck, RotateCcw, AlertTriangle, MessageCircle, User, Users } from 'lucide-react';
import { playTapSound } from '@/lib/sound';
import { btn, formatMoney, formatTotals } from './ui';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus }) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const created = new Date(order.created_at).getTime();
      setElapsedMinutes(Math.max(0, Math.floor((Date.now() - created) / 60000)));
    };
    calculateElapsed();
    const interval = setInterval(calculateElapsed, 30000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  // Group items by guest
  const groupedItems = order.items.reduce<Record<string, typeof order.items>>((acc, it) => {
    const label = it.person_label || 'Toute la table';
    if (!acc[label]) acc[label] = [];
    acc[label].push(it);
    return acc;
  }, {});
  const groups = Object.entries(groupedItems);

  const isServed = order.status === 'servie';
  const late = !isServed && elapsedMinutes > 20;
  const warn = !isServed && elapsedMinutes > 10;

  const waitClass = late
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : warn
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-slate-50 text-slate-600 border-slate-200';

  const formattedElapsed =
    elapsedMinutes === 0
      ? 'À l’instant'
      : elapsedMinutes >= 60
      ? `${Math.floor(elapsedMinutes / 60)} h ${String(elapsedMinutes % 60).padStart(2, '0')}`
      : `${elapsedMinutes} min`;

  const whatsapp = order.customer?.whatsapp?.replace(/[^\d+]/g, '').replace(/^\+/, '');

  return (
    <article
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', order.id)}
      className={`bg-white rounded-lg border shadow-sm cursor-grab active:cursor-grabbing overflow-hidden ${
        late ? 'border-rose-300' : 'border-slate-200'
      } ${isServed ? 'opacity-80' : ''}`}
    >
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center shrink-0">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">Table</span>
            <span className="text-lg font-bold leading-tight">{order.table_number}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{order.customer?.full_name || 'Client'}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>{order.order_number}</span>
              <span>·</span>
              <Users className="w-3 h-3" />
              <span>
                {order.people_count} pers.
              </span>
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 shrink-0 ${waitClass}`}
          title="Temps écoulé depuis la commande"
        >
          <Clock className="w-3.5 h-3.5" />
          {formattedElapsed}
        </span>
      </header>

      {/* Items */}
      <div className="px-4 py-3 space-y-3">
        {groups.map(([personLabel, items]) => (
          <div key={personLabel}>
            {groups.length > 1 && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <User className="w-3 h-3" />
                {personLabel}
              </p>
            )}
            <ul className="space-y-1.5">
              {items.map((it) => (
                <li key={it.id} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="min-w-[28px] h-6 px-1.5 rounded-md bg-slate-100 text-slate-900 text-sm font-bold flex items-center justify-center shrink-0">
                      {it.quantity}×
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 leading-snug">{it.item_name}</p>
                      {it.special_instructions && (
                        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 mt-1 inline-block">
                          {it.special_instructions}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0 pt-1">{formatMoney(it.item_price * it.quantity, it.currency)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {order.notes && (
          <div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>Note :</strong> {order.notes}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[11px] text-slate-500 block">Total</span>
            <span className="text-base font-bold text-slate-900">{formatTotals({ cdf: order.total, usd: order.total_usd || 0 })}</span>
          </div>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-md border border-slate-200 bg-white text-emerald-600 hover:bg-emerald-50 flex items-center justify-center"
              title={`Écrire à ${order.customer?.full_name || 'ce client'} sur WhatsApp`}
              aria-label="Contacter le client sur WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}
        </div>

        {!isServed ? (
          <button
            onClick={() => {
              playTapSound();
              onUpdateStatus(order.id, 'servie');
            }}
            className={btn.success}
          >
            <CheckCheck className="w-4 h-4" />
            Marquer servie
          </button>
        ) : (
          <button
            onClick={() => {
              playTapSound();
              onUpdateStatus(order.id, 'nouvelle');
            }}
            className={btn.ghost}
          >
            <RotateCcw className="w-4 h-4" />
            Remettre à préparer
          </button>
        )}
      </footer>
    </article>
  );
};
