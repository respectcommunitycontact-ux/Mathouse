'use client';

import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { DataService } from '@/lib/data-service';
import { 
  Users, 
  MessageCircle, 
  Search, 
  Download, 
  Calendar, 
  ShoppingBag, 
  Sparkles 
} from 'lucide-react';
import { playTapSound } from '@/lib/sound';

export default function CustomersCRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    DataService.getCustomers().then(setCustomers);

    const unsubscribe = DataService.subscribe((event) => {
      if (event.type === 'CUSTOMER_UPDATED') {
        DataService.getCustomers().then(setCustomers);
      }
    });

    return unsubscribe;
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.full_name.toLowerCase().includes(q) || c.whatsapp.includes(q);
  });

  const exportCSV = () => {
    playTapSound();
    const headers = 'Nom;WhatsApp;Total Commandes;Derniere Visite\n';
    const rows = customers
      .map((c) => `"${c.full_name}";"${c.whatsapp}";${c.total_orders};"${new Date(c.last_visit).toLocaleDateString()}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `restotablet_crm_clients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B1017]/75 backdrop-blur-sm p-3 sm:p-5 lg:p-6 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pb-3 sm:pb-4 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <span>CRM Clients &amp; WhatsApp</span>
            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-bold whitespace-nowrap">
              {customers.length} contacts
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block mt-0.5">
            Contacts WhatsApp capturés automatiquement à chaque validation de commande.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher nom ou tél..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs rounded-full bg-[#121822] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition"
            />
          </div>

          <button
            onClick={exportCSV}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#121822] hover:bg-[#1A2230] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold flex items-center gap-1.5 transition shrink-0 whitespace-nowrap active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden xs:inline">Exporter CSV</span>
            <span className="xs:hidden">CSV</span>
          </button>
        </div>
      </div>

      {/* Customers List Content */}
      <div className="flex-1 overflow-y-auto py-3 sm:py-5 pr-1 pb-4">
        {filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Aucun client enregistré pour l&apos;instant.
          </div>
        ) : (
          <>
            {/* Mobile / Small Screen Card View (< md) */}
            <div className="md:hidden space-y-2.5">
              {filteredCustomers.map((cust) => {
                const cleanWa = cust.whatsapp.replace(/[\s\-\.\(\)]/g, '');
                const waUrl = `https://wa.me/${cleanWa.replace(/^\+/, '')}?text=Bonjour%20${encodeURIComponent(
                  cust.full_name
                )},%20merci%20d'avoir%20choisi%20notre%20restaurant!`;

                return (
                  <div
                    key={cust.id}
                    className="bg-[#121822] rounded-2xl border border-white/10 p-3 flex flex-col gap-2.5 shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold font-mono text-xs shrink-0">
                          {cust.full_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-xs truncate">{cust.full_name}</h4>
                          <span className="font-mono text-[11px] text-slate-400 block truncate">{cust.whatsapp}</span>
                        </div>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition shrink-0 active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                      <span className="inline-flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-[#D4AF37]" />
                        {cust.total_orders} {cust.total_orders === 1 ? 'commande' : 'commandes'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(cust.last_visit).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block bg-[#121822] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1017] text-slate-400 uppercase text-[11px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-5">Client / Responsable</th>
                    <th className="py-3.5 px-5">WhatsApp</th>
                    <th className="py-3.5 px-5">Commandes Passées</th>
                    <th className="py-3.5 px-5">Dernière Visite</th>
                    <th className="py-3.5 px-5 text-right">Action Rapide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {filteredCustomers.map((cust) => {
                    const cleanWa = cust.whatsapp.replace(/[\s\-\.\(\)]/g, '');
                    const waUrl = `https://wa.me/${cleanWa.replace(/^\+/, '')}?text=Bonjour%20${encodeURIComponent(
                      cust.full_name
                    )},%20merci%20d'avoir%20choisi%20notre%20restaurant!`;

                    return (
                      <tr key={cust.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold font-mono text-xs">
                              {cust.full_name.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-white block text-sm">
                                {cust.full_name}
                              </span>
                              {cust.notes && (
                                <span className="text-[11px] text-[#D4AF37] flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                                  {cust.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 font-mono font-medium text-slate-200">
                          {cust.whatsapp}
                        </td>

                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 text-xs font-semibold border border-white/10">
                            <ShoppingBag className="w-3 h-3 text-[#D4AF37]" />
                            {cust.total_orders} {cust.total_orders === 1 ? 'commande' : 'commandes'}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-slate-400">
                          <span className="flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {new Date(cust.last_visit).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition active:scale-95"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Contacter</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
