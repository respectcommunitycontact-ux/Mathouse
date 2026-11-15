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
  Receipt,
  Check,
  TrendingUp,
  Search,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { playTapSound } from '@/lib/sound';
import {
  AvailabilitySwitch,
  Card,
  CardHeader,
  CountPill,
  EmptyState,
  PageContainer,
  PageHeader,
  StatusBadge,
  StatusLegend,
  TABLE_STATUS,
  btn,
  formatMoney,
  formatTotals,
  inputClass,
} from '@/components/admin/ui';

const minutesSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));

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
  const freeTables = tables.filter((t) => t.status === 'libre');
  const busyTables = tables.length - freeTables.length;
  const outOfStock = menuItems.filter((m) => !m.is_available);

  const billedOrders = orders.filter((o) => o.status !== 'annulee');
  const revenue = {
    cdf: billedOrders.reduce((sum, o) => sum + (o.total || 0), 0),
    usd: billedOrders.reduce((sum, o) => sum + (o.total_usd || 0), 0),
  };
  const averageBasket = billedOrders.length > 0 ? revenue.cdf / billedOrders.length : 0;

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Handlers
  const handleResolveServerCall = async (tableNumber: number) => {
    playTapSound();
    await DataService.updateTableStatus(tableNumber, 'occupee');
    loadData();
  };

  const handleToggleStock = async (itemId: string) => {
    playTapSound();
    await DataService.toggleMenuItemAvailability(itemId);
    loadData();
  };

  const filteredDishStock = menuItems.filter((m) => {
    if (!dishSearch) return true;
    const q = dishSearch.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
  });

  const attentionCount = serverCalls.length + billRequests.length;

  const kpis = [
    {
      label: 'Commandes en cours',
      value: String(activeOrders.length),
      sub: `${servedOrders.length} déjà servie${servedOrders.length > 1 ? 's' : ''}`,
      icon: ChefHat,
      href: '/admin/cuisine',
      tone: 'text-[#E85D04] bg-orange-50',
    },
    {
      label: 'Tables occupées',
      value: `${busyTables} / ${tables.length}`,
      sub: `${freeTables.length} libre${freeTables.length > 1 ? 's' : ''}`,
      icon: LayoutGrid,
      href: '/admin/tables',
      tone: 'text-sky-700 bg-sky-50',
    },
    {
      label: 'Chiffre d’affaires du jour',
      value: formatMoney(revenue.cdf),
      sub: revenue.usd > 0 ? `+ ${formatMoney(revenue.usd, 'USD')} · panier moyen ${formatMoney(averageBasket)}` : `Panier moyen ${formatMoney(averageBasket)}`,
      icon: TrendingUp,
      href: null,
      tone: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Plats en rupture',
      value: String(outOfStock.length),
      sub: `sur ${menuItems.length} plats à la carte`,
      icon: UtensilsCrossed,
      href: '/admin/menu',
      tone: outOfStock.length > 0 ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-100',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Vue d’ensemble"
        description="Ce qui se passe en salle et en cuisine en ce moment. Les informations se mettent à jour automatiquement."
        meta={<span className="text-sm text-slate-500 capitalize">{today}</span>}
        actions={
          <Link href="/admin/cuisine" className={btn.primary}>
            <ChefHat className="w-4 h-4" />
            Ouvrir les commandes
          </Link>
        }
      />

      {/* 1. What needs action right now */}
      {attentionCount > 0 ? (
        <Card className="mb-6 border-rose-200 overflow-hidden">
          <div className="px-5 py-3 bg-rose-50 border-b border-rose-200 flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-semibold text-rose-800">
              À traiter maintenant · {attentionCount} demande{attentionCount > 1 ? 's' : ''} en salle
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {serverCalls.map((t) => (
              <li key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-rose-600 text-white font-bold text-sm flex items-center justify-center">
                    {t.number}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Table {t.number} appelle un serveur</p>
                    <p className="text-xs text-slate-500">Rendez-vous à la table puis marquez la demande comme traitée.</p>
                  </div>
                </div>
                <button onClick={() => handleResolveServerCall(t.number)} className={btn.secondary}>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Traité
                </button>
              </li>
            ))}
            {billRequests.map((t) => (
              <li key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-amber-500 text-white font-bold text-sm flex items-center justify-center">
                    {t.number}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Table {t.number} demande l’addition</p>
                    <p className="text-xs text-slate-500">Une fois réglée, libérez la table depuis « Salle & tablettes ».</p>
                  </div>
                </div>
                <Link href="/admin/tables" className={btn.secondary}>
                  <Receipt className="w-4 h-4 text-amber-600" />
                  Voir la salle
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4" />
          Aucune demande en attente en salle.
        </div>
      )}

      {/* 2. Key figures */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => {
          const Icon = k.icon;
          const inner = (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{k.label}</span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.tone}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{k.value}</p>
              <p className="mt-1 text-xs text-slate-500 flex items-center justify-between">
                <span>{k.sub}</span>
                {k.href && <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E85D04] transition" />}
              </p>
            </>
          );
          return k.href ? (
            <Link
              key={k.label}
              href={k.href}
              className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition"
            >
              {inner}
            </Link>
          ) : (
            <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-5">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* 3. Orders in progress */}
          <Card>
            <CardHeader
              title="Commandes en cours"
              description="Les plus anciennes en premier. Cliquez pour les gérer en cuisine."
              icon={<ChefHat className="w-4 h-4" />}
              action={
                <Link href="/admin/cuisine" className={btn.ghost}>
                  Tout voir <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            {activeOrders.length === 0 ? (
              <EmptyState
                icon={<ChefHat className="w-5 h-5" />}
                title="Aucune commande en cours"
                hint="Les commandes passées sur les tablettes apparaîtront ici automatiquement."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-500 border-b border-slate-200">
                      <th className="px-5 py-2.5">Table</th>
                      <th className="px-5 py-2.5">Commande</th>
                      <th className="px-5 py-2.5">Client</th>
                      <th className="px-5 py-2.5">Attente</th>
                      <th className="px-5 py-2.5 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...activeOrders]
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((ord) => {
                        const wait = minutesSince(ord.created_at);
                        return (
                          <tr key={ord.id} className="hover:bg-slate-50">
                            <td className="px-5 py-3 font-semibold text-slate-900">Table {ord.table_number}</td>
                            <td className="px-5 py-3 text-slate-600">
                              {ord.order_number}
                              <span className="text-slate-400"> · {ord.items.reduce((s, i) => s + i.quantity, 0)} articles</span>
                            </td>
                            <td className="px-5 py-3 text-slate-600">{ord.customer?.full_name || '—'}</td>
                            <td className="px-5 py-3">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                  wait > 20 ? 'text-rose-700' : wait > 10 ? 'text-amber-700' : 'text-slate-600'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                {wait} min
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right font-semibold text-slate-900">{formatTotals({ cdf: ord.total, usd: ord.total_usd || 0 })}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* 4. Floor overview */}
          <Card>
            <CardHeader
              title="Plan de salle"
              description="État de chaque table, mis à jour par les tablettes."
              icon={<LayoutGrid className="w-4 h-4" />}
              action={
                <Link href="/admin/tables" className={btn.ghost}>
                  Gérer <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3">
                {tables.map((tbl) => (
                  <Link
                    key={tbl.id}
                    href="/admin/tables"
                    className={`rounded-lg border bg-white p-3 hover:shadow-sm transition ${TABLE_STATUS[tbl.status].card}`}
                    title={TABLE_STATUS[tbl.status].help}
                  >
                    <p className="text-sm font-bold text-slate-900">Table {tbl.number}</p>
                    <div className="mt-2">
                      <StatusBadge status={tbl.status} />
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <StatusLegend />
              </div>
            </div>
          </Card>
        </div>

        {/* 5. Quick stock */}
        <Card className="flex flex-col xl:max-h-[760px]">
          <CardHeader
            title="Disponibilité des plats"
            description="Un plat en rupture disparaît de la commande sur les tablettes."
            icon={<UtensilsCrossed className="w-4 h-4" />}
            action={outOfStock.length > 0 ? <CountPill tone="danger">{outOfStock.length} en rupture</CountPill> : undefined}
          />
          <div className="px-5 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un plat ou une catégorie"
                value={dishSearch}
                onChange={(e) => setDishSearch(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2">
            {filteredDishStock.map((dish) => (
              <li key={dish.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${dish.is_available ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                    {dish.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {dish.category} · {formatMoney(dish.price, dish.currency)}
                  </p>
                </div>
                <AvailabilitySwitch available={dish.is_available} onToggle={() => handleToggleStock(dish.id)} compact />
              </li>
            ))}
            {filteredDishStock.length === 0 && <EmptyState title="Aucun plat trouvé" />}
          </ul>
          <div className="px-5 py-3 border-t border-slate-200">
            <Link href="/admin/menu" className="text-sm font-semibold text-[#C2410C] hover:underline inline-flex items-center gap-1">
              Modifier la carte complète <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      <p className="mt-8 text-xs text-slate-400 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" />
        Les contacts clients sont enregistrés automatiquement à chaque commande validée.
      </p>
    </PageContainer>
  );
}
