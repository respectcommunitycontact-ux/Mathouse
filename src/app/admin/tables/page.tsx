'use client';

import React, { useState, useEffect } from 'react';
import { TableRecord, TableStatus } from '@/types';
import { DataService } from '@/lib/data-service';
import { Battery, BatteryLow, Wifi, WifiOff, Zap, Check, RotateCcw, LayoutGrid } from 'lucide-react';
import { playTapSound } from '@/lib/sound';
import {
  Card,
  CountPill,
  EmptyState,
  PageContainer,
  PageHeader,
  StatusBadge,
  StatusLegend,
  TABLE_STATUS,
  btn,
} from '@/components/admin/ui';

type Filter = 'all' | 'attention' | TableStatus;

export default function TablesManagementPage() {
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const loadTables = async () => {
    const data = await DataService.getTables();
    setTables(data);
  };

  useEffect(() => {
    loadTables();
    const unsubscribe = DataService.subscribe((event) => {
      if (event.type === 'TABLE_STATUS_CHANGED') {
        loadTables();
      }
    });

    // Detect actual hardware battery via Web Battery API
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any)
        .getBattery()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((battery: any) => {
          const sync = () => {
            const level = Math.round(battery.level * 100);
            DataService.updateTabletHeartbeat(1, level, battery.charging);
            loadTables();
          };
          sync();
          battery.addEventListener('levelchange', sync);
          battery.addEventListener('chargingchange', sync);
        })
        .catch(() => {});
    }

    return () => unsubscribe();
  }, []);

  const setStatus = async (tableNumber: number, status: TableStatus) => {
    playTapSound();
    await DataService.updateTableStatus(tableNumber, status);
    await loadTables();
  };

  const onlineCount = tables.filter((t) => t.is_online).length;
  const lowBattery = tables.filter((t) => t.battery_level < 20 && !t.is_charging).length;
  const count = (s: TableStatus) => tables.filter((t) => t.status === s).length;
  const attention = count('serveur_appele') + count('addition_demandee');

  const filters: { id: Filter; label: string; n: number }[] = [
    { id: 'all', label: 'Toutes', n: tables.length },
    { id: 'attention', label: 'À traiter', n: attention },
    { id: 'occupee', label: 'Occupées', n: count('occupee') },
    { id: 'libre', label: 'Libres', n: count('libre') },
  ];

  const filteredTables = tables.filter((tbl) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'attention') return tbl.status === 'serveur_appele' || tbl.status === 'addition_demandee';
    return tbl.status === activeFilter;
  });

  // Tables that need someone first
  const priority: Record<TableStatus, number> = { serveur_appele: 0, addition_demandee: 1, occupee: 2, libre: 3 };
  const sortedTables = [...filteredTables].sort(
    (a, b) => priority[a.status] - priority[b.status] || a.number - b.number
  );

  return (
    <PageContainer>
      <PageHeader
        title="Salle & tablettes"
        description="Chaque carte correspond à une table et à sa tablette. Traitez les appels serveur et les additions, puis libérez la table quand les clients sont partis."
        meta={
          <>
            <CountPill tone="success">
              {onlineCount}/{tables.length} tablettes connectées
            </CountPill>
            {lowBattery > 0 && <CountPill tone="danger">{lowBattery} batterie faible</CountPill>}
          </>
        }
      />

      <div className="flex flex-col gap-3 mb-5">
        <div className="inline-flex self-start p-1 rounded-lg bg-slate-200/70 overflow-x-auto max-w-full">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                playTapSound();
                setActiveFilter(f.id);
              }}
              className={`h-9 px-3.5 rounded-md text-sm font-semibold whitespace-nowrap transition ${
                activeFilter === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}{' '}
              <span className={f.id === 'attention' && f.n > 0 ? 'text-rose-600' : 'text-slate-400'}>({f.n})</span>
            </button>
          ))}
        </div>
        <StatusLegend />
      </div>

      {sortedTables.length === 0 ? (
        <Card>
          <EmptyState icon={<LayoutGrid className="w-5 h-5" />} title="Aucune table dans ce filtre" hint="Choisissez « Toutes » pour voir toute la salle." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {sortedTables.map((tbl) => {
            const s = TABLE_STATUS[tbl.status];
            const batteryLow = tbl.battery_level < 20 && !tbl.is_charging;
            return (
              <Card key={tbl.id} className={`p-4 flex flex-col gap-3 ${s.card}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-slate-900 leading-tight">Table {tbl.number}</p>
                    <div className="mt-1.5">
                      <StatusBadge status={tbl.status} />
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500 space-y-1">
                    <p
                      className={`flex items-center justify-end gap-1 ${batteryLow ? 'text-rose-600 font-semibold' : ''}`}
                      title={tbl.is_charging ? 'Tablette en charge' : 'Batterie de la tablette'}
                    >
                      {batteryLow ? <BatteryLow className="w-3.5 h-3.5" /> : <Battery className="w-3.5 h-3.5" />}
                      {tbl.battery_level} %
                      {tbl.is_charging && <Zap className="w-3 h-3 text-amber-500" />}
                    </p>
                    <p className={`flex items-center justify-end gap-1 ${tbl.is_online ? '' : 'text-rose-600 font-semibold'}`}>
                      {tbl.is_online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                      {tbl.is_online ? 'En ligne' : 'Hors ligne'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500">{s.help}</p>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-auto">
                  {tbl.status === 'serveur_appele' && (
                    <button onClick={() => setStatus(tbl.number, 'occupee')} className={`${btn.danger} flex-1`}>
                      <Check className="w-4 h-4" />
                      Appel traité
                    </button>
                  )}
                  {tbl.status === 'addition_demandee' && (
                    <button onClick={() => setStatus(tbl.number, 'libre')} className={`${btn.primary} flex-1 h-9`}>
                      <Check className="w-4 h-4" />
                      Payée, libérer
                    </button>
                  )}
                  {tbl.status === 'occupee' && (
                    <button onClick={() => setStatus(tbl.number, 'libre')} className={`${btn.secondary} flex-1 h-9`}>
                      <RotateCcw className="w-4 h-4" />
                      Libérer la table
                    </button>
                  )}
                  {tbl.status === 'libre' && <p className="text-xs text-slate-400 py-2">Aucune action nécessaire</p>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
