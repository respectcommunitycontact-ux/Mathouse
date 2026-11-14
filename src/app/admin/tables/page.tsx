'use client';

import React, { useState, useEffect } from 'react';
import { TableRecord } from '@/types';
import { DataService } from '@/lib/data-service';
import { 
  Battery, 
  Wifi, 
  WifiOff, 
  Bell, 
  Receipt, 
  RotateCcw, 
  Clock,
  Zap
} from 'lucide-react';
import { playTapSound } from '@/lib/sound';

export default function TablesManagementPage() {
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'alertes' | 'addition' | 'libres'>('all');

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
      (navigator as any).getBattery().then((battery: any) => {
        const sync = () => {
          const level = Math.round(battery.level * 100);
          DataService.updateTabletHeartbeat(1, level, battery.charging);
          loadTables();
        };
        sync();
        battery.addEventListener('levelchange', sync);
        battery.addEventListener('chargingchange', sync);
      }).catch(() => {});
    }

    return () => unsubscribe();
  }, []);

  const handleResetTableStatus = async (tableNumber: number) => {
    playTapSound();
    await DataService.updateTableStatus(tableNumber, 'libre');
    await loadTables();
  };

  const onlineCount = tables.filter((t) => t.is_online).length;
  const alertCount = tables.filter((t) => t.status === 'serveur_appele').length;
  const billCount = tables.filter((t) => t.status === 'addition_demandee').length;
  const freeCount = tables.filter((t) => t.status === 'libre').length;

  const filteredTables = tables.filter((tbl) => {
    if (activeFilter === 'alertes') return tbl.status === 'serveur_appele';
    if (activeFilter === 'addition') return tbl.status === 'addition_demandee';
    if (activeFilter === 'libres') return tbl.status === 'libre';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B1017]/75 backdrop-blur-sm p-3 sm:p-5 lg:p-6 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pb-3 sm:pb-4 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <span>Parc des Tables</span>
            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold whitespace-nowrap">
              {onlineCount} / {tables.length} en ligne
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block mt-0.5">
            Surveillance en temps réel des tablettes en salle et des demandes d&apos;assistance.
          </p>
        </div>

        {/* Minimalist Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => {
              playTapSound();
              setActiveFilter('all');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition border whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-white/15 text-white border-white/30 font-black shadow-sm'
                : 'bg-[#121822] text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            Toutes ({tables.length})
          </button>

          <button
            onClick={() => {
              playTapSound();
              setActiveFilter('alertes');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition border whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'alertes'
                ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/25'
                : alertCount > 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-[#121822] text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <Bell className="w-3 h-3" />
            <span>Appel Serveur ({alertCount})</span>
          </button>

          <button
            onClick={() => {
              playTapSound();
              setActiveFilter('addition');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition border whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'addition'
                ? 'bg-[#D4AF37] text-[#0B1017] border-[#E5C158] shadow-gold-subtle'
                : billCount > 0
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40'
                : 'bg-[#121822] text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <Receipt className="w-3 h-3" />
            <span>Addition ({billCount})</span>
          </button>

          <button
            onClick={() => {
              playTapSound();
              setActiveFilter('libres');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition border whitespace-nowrap ${
              activeFilter === 'libres'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-[#121822] text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            Libres ({freeCount})
          </button>
        </div>
      </div>

      {/* Tables Grid - Minimalist & Compact */}
      <div className="flex-1 overflow-y-auto py-3 sm:py-4 pr-1 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-2.5 sm:gap-3">
          {filteredTables.map((tbl) => {
            const isAlert = tbl.status === 'serveur_appele';
            const isBill = tbl.status === 'addition_demandee';
            const isOccupied = tbl.status === 'occupee';

            return (
              <div
                key={tbl.id}
                className={`rounded-2xl border p-3 flex flex-col justify-between transition-all duration-200 shadow-md ${
                  isAlert
                    ? 'bg-rose-950/25 border-rose-500 shadow-rose-500/20 ring-1 ring-rose-500'
                    : isBill
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-gold-subtle ring-1 ring-[#D4AF37]'
                    : isOccupied
                    ? 'bg-[#151D29] border-blue-500/30'
                    : 'bg-[#121822]/70 border-white/[0.08] hover:border-white/20'
                }`}
              >
                {/* Top Row: Number, Name & Hardware */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isAlert
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isBill
                          ? 'bg-[#D4AF37] text-[#0B1017] font-black'
                          : isOccupied
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-white/5 text-slate-300 border border-white/10'
                      }`}
                    >
                      {tbl.number}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                      Table {tbl.number}
                    </span>
                  </div>

                  {/* Hardware Indicators (Real Battery & Wi-Fi) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span 
                      className={`text-[10px] font-mono flex items-center gap-1 ${
                        tbl.battery_level < 20 
                          ? 'text-rose-400 font-bold animate-pulse' 
                          : tbl.battery_level < 35 
                          ? 'text-amber-400 font-semibold' 
                          : 'text-slate-400'
                      }`}
                      title={tbl.is_charging ? 'Tablette branchée / en charge' : 'Niveau de batterie réel'}
                    >
                      <Battery className="w-3 h-3" />
                      <span>{tbl.battery_level}%</span>
                      {tbl.is_charging && (
                        <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
                      )}
                    </span>

                    <span title={tbl.is_online ? 'Connectée au réseau' : 'Hors-ligne'} className="flex items-center">
                      {tbl.is_online ? (
                        <Wifi className="w-3 h-3 text-emerald-400/80 shrink-0" />
                      ) : (
                        <WifiOff className="w-3 h-3 text-rose-400 shrink-0" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Status text & Action */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/[0.06] text-xs gap-1.5">
                  <div className="min-w-0 flex-1">
                    {isAlert && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 animate-pulse truncate">
                        <Bell className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">Serveur appelé !</span>
                      </span>
                    )}
                    {isBill && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] animate-pulse truncate">
                        <Receipt className="w-3 h-3 text-[#D4AF37] shrink-0" />
                        <span className="truncate">Addition demandée</span>
                      </span>
                    )}
                    {isOccupied && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-300 truncate">
                        <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">En dégustation</span>
                      </span>
                    )}
                    {!isAlert && !isBill && !isOccupied && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">Libre</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isAlert && (
                      <button
                        onClick={async () => {
                          playTapSound();
                          await DataService.updateTableStatus(tbl.number, 'occupee');
                          await loadTables();
                        }}
                        className="px-2 py-0.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-extrabold flex items-center gap-0.5 transition active:scale-95 shadow"
                        title="Acquitter l'appel serveur"
                      >
                        <span>Acquitter</span>
                      </button>
                    )}

                    {tbl.status !== 'libre' && (
                      <button
                        onClick={() => handleResetTableStatus(tbl.number)}
                        className="px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition active:scale-95 border border-white/10 shrink-0"
                        title="Libérer la table"
                      >
                        <RotateCcw className="w-2.5 h-2.5 text-[#D4AF37]" />
                        <span>Libérer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
