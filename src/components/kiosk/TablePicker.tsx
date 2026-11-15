'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { TableRecord, TableStatus } from '@/types';
import { DataService } from '@/lib/data-service';
import { useTabletStore } from '@/store/tabletStore';
import { playTapSound } from '@/lib/sound';
import { enterFullscreen } from '@/lib/pwa';
import { Bell, Receipt, HandPlatter } from 'lucide-react';

const STATUS: Record<TableStatus, { label: string; dot: string; ring: string }> = {
  libre: { label: 'Libre', dot: 'bg-emerald-400', ring: 'border-white/10' },
  occupee: { label: 'Occupée', dot: 'bg-sky-400', ring: 'border-sky-400/40' },
  serveur_appele: { label: 'Appel serveur', dot: 'bg-rose-500', ring: 'border-rose-500/70' },
  addition_demandee: { label: 'Addition', dot: 'bg-amber-400', ring: 'border-amber-400/70' },
};

/**
 * Step 1, done by the waitress: choose the table, then hand the tablet to the customer.
 */
export const TablePicker: React.FC = () => {
  const { config, startTableSession } = useTabletStore();
  const [tables, setTables] = useState<TableRecord[]>([]);

  useEffect(() => {
    DataService.initData();
    const load = () => DataService.getTables().then((t) => setTables([...t].sort((a, b) => a.number - b.number)));
    load();
    const unsubscribe = DataService.subscribe((event) => {
      if (event.type === 'TABLE_STATUS_CHANGED') load();
    });
    return unsubscribe;
  }, []);

  const choose = (n: number) => {
    playTapSound();
    enterFullscreen();
    startTableSession(n);
  };

  const needsAttention = tables.filter((t) => t.status === 'serveur_appele' || t.status === 'addition_demandee');

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0B0E14] text-slate-100 select-none overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-5 sm:px-8 py-4 flex items-center justify-between border-b border-white/[0.06]">
        <div className="relative h-10 sm:h-12 w-40 sm:w-52">
          <Image src="/logo.png" alt="Mat House Restaurant" fill className="object-contain object-left" priority />
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-slate-300">
          <HandPlatter className="w-4 h-4 text-[#F48C06]" />
          Espace serveur
        </span>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F48C06]">Étape 1 · Serveur</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-serif font-semibold text-white">Pour quelle table ?</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Touchez le numéro de la table, puis donnez la tablette au client pour qu’il passe sa commande.
          </p>

          {needsAttention.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {needsAttention.map((t) => (
                <span
                  key={t.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    t.status === 'serveur_appele'
                      ? 'bg-rose-500/15 text-rose-200 border-rose-500/40'
                      : 'bg-amber-400/15 text-amber-100 border-amber-400/40'
                  }`}
                >
                  {t.status === 'serveur_appele' ? <Bell className="w-3.5 h-3.5" /> : <Receipt className="w-3.5 h-3.5" />}
                  Table {t.number} · {STATUS[t.status].label}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {tables.map((t) => {
              const s = STATUS[t.status];
              const isLast = t.number === config.tableNumber;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => choose(t.number)}
                  className={`relative aspect-square rounded-2xl bg-[#141A26] hover:bg-[#1B2333] active:scale-[0.97] border-2 ${s.ring} flex flex-col items-center justify-center transition`}
                  aria-label={`Table ${t.number}, ${s.label}`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Table</span>
                  <span className="text-4xl sm:text-5xl font-bold text-white leading-none mt-1">{t.number}</span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  {isLast && (
                    <span className="absolute top-2 right-2 text-[10px] font-semibold text-[#F48C06]">Dernière</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
