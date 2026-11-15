'use client';

import React, { useEffect, useState } from 'react';
import { useKitchenStore } from '@/store/kitchenStore';
import { OrderCard } from './OrderCard';
import { Order } from '@/types';
import { CheckCircle2, Flame, Search, RefreshCw } from 'lucide-react';
import { playTapSound } from '@/lib/sound';
import { CountPill, EmptyState, PageContainer, PageHeader, btn, inputClass } from './ui';

type ColumnId = 'nouvelle' | 'servie';

export const KitchenKanban: React.FC = () => {
  const { orders, isLoading, fetchOrders, updateStatus, initRealtime } = useKitchenStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMobileColumn, setActiveMobileColumn] = useState<ColumnId>('nouvelle');

  useEffect(() => {
    const unsubscribe = initRealtime();
    return () => unsubscribe();
  }, [initRealtime]);

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchesTable = `table ${o.table_number}`.includes(q) || String(o.table_number) === q;
    const matchesNumber = o.order_number.toLowerCase().includes(q);
    const matchesCustomer = o.customer?.full_name.toLowerCase().includes(q) || o.customer?.whatsapp.includes(q);
    return matchesTable || matchesNumber || matchesCustomer;
  });

  const columns: {
    id: ColumnId;
    title: string;
    help: string;
    icon: React.ReactNode;
    accent: string;
    filter: (order: Order) => boolean;
    sort: (a: Order, b: Order) => number;
    emptyTitle: string;
    emptyHint: string;
  }[] = [
    {
      id: 'nouvelle',
      title: 'À préparer',
      help: 'Les plus anciennes en haut. Une fois le plat envoyé en salle, cliquez sur « Marquer servie ».',
      icon: <Flame className="w-4 h-4" />,
      accent: 'text-[#C2410C] bg-orange-50',
      filter: (o) => o.status !== 'servie' && o.status !== 'annulee',
      sort: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      emptyTitle: 'Rien à préparer',
      emptyHint: 'Les nouvelles commandes des tablettes s’afficheront ici avec un signal sonore.',
    },
    {
      id: 'servie',
      title: 'Servies',
      help: 'Historique du service. Une erreur ? « Remettre à préparer » la renvoie à gauche.',
      icon: <CheckCircle2 className="w-4 h-4" />,
      accent: 'text-emerald-700 bg-emerald-50',
      filter: (o) => o.status === 'servie',
      sort: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      emptyTitle: 'Aucune commande servie',
      emptyHint: 'Les commandes marquées servies apparaîtront ici.',
    },
  ];

  const handleDrop = (e: React.DragEvent, targetStatus: ColumnId) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) {
      playTapSound();
      updateStatus(orderId, targetStatus);
    }
  };

  const activeCount = orders.filter((o) => o.status !== 'servie' && o.status !== 'annulee').length;
  const servedCount = orders.filter((o) => o.status === 'servie').length;

  const renderColumn = (col: (typeof columns)[number]) => {
    const colOrders = filteredOrders.filter(col.filter).sort(col.sort);
    return (
      <section
        key={col.id}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, col.id)}
        className="flex flex-col bg-slate-100/70 rounded-xl border border-slate-200 min-h-[420px]"
      >
        <header className="px-4 py-3 border-b border-slate-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${col.accent}`}>{col.icon}</span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900">{col.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{col.help}</p>
            </div>
          </div>
          <CountPill tone={col.id === 'nouvelle' && colOrders.length > 0 ? 'brand' : 'neutral'}>{colOrders.length}</CountPill>
        </header>
        <div className="p-3 space-y-3 flex-1">
          {colOrders.length === 0 ? (
            <div className="h-full rounded-lg border-2 border-dashed border-slate-200 bg-white/60">
              <EmptyState title={col.emptyTitle} hint={col.emptyHint} />
            </div>
          ) : (
            colOrders.map((order) => <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />)
          )}
        </div>
      </section>
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Commandes"
        description="Toutes les commandes passées depuis les tablettes. Vous pouvez aussi glisser une carte d’une colonne à l’autre."
        meta={
          <>
            <CountPill tone="brand">{activeCount} à préparer</CountPill>
            <CountPill tone="success">{servedCount} servies</CountPill>
          </>
        }
        actions={
          <>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Table, client ou n° de commande"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
            <button
              onClick={() => {
                playTapSound();
                fetchOrders();
              }}
              className={btn.secondary}
              title="Recharger les commandes"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </>
        }
      />

      {/* Mobile: one column at a time */}
      <div className="md:hidden grid grid-cols-2 gap-1 p-1 mb-4 rounded-lg bg-slate-200/70">
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
              className={`h-10 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition ${
                isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              {col.title}
              <span className="text-xs text-slate-500">({count})</span>
            </button>
          );
        })}
      </div>
      <div className="md:hidden">{renderColumn(columns.find((c) => c.id === activeMobileColumn) || columns[0])}</div>

      {/* Desktop: two columns */}
      <div className="hidden md:grid grid-cols-2 gap-5">{columns.map(renderColumn)}</div>
    </PageContainer>
  );
};
