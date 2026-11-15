'use client';

import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { DataService } from '@/lib/data-service';
import { Users, MessageCircle, Search, Download } from 'lucide-react';
import { playTapSound } from '@/lib/sound';
import { Card, CountPill, EmptyState, PageContainer, PageHeader, btn, inputClass } from '@/components/admin/ui';

const waLink = (cust: Customer) => {
  const clean = cust.whatsapp.replace(/[\s\-.()]/g, '').replace(/^\+/, '');
  return `https://wa.me/${clean}?text=Bonjour%20${encodeURIComponent(cust.full_name)},%20merci%20d'avoir%20choisi%20notre%20restaurant!`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

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

  const regulars = customers.filter((c) => c.total_orders >= 3).length;

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
    <PageContainer>
      <PageHeader
        title="Clients"
        description="Chaque client qui valide une commande sur une tablette est ajouté ici avec son numéro WhatsApp. Vous pouvez le recontacter ou exporter la liste."
        meta={
          <>
            <CountPill>{customers.length} contacts</CountPill>
            {regulars > 0 && <CountPill tone="brand">{regulars} habitués (3+ commandes)</CountPill>}
          </>
        }
        actions={
          <>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Nom ou numéro de téléphone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
            <button onClick={exportCSV} className={btn.secondary} title="Télécharger la liste au format tableur (CSV)">
              <Download className="w-4 h-4" />
              Exporter (Excel)
            </button>
          </>
        }
      />

      <Card className="overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-5 h-5" />}
            title={customers.length === 0 ? 'Aucun client pour l’instant' : 'Aucun client ne correspond'}
            hint={
              customers.length === 0
                ? 'Les clients apparaissent ici dès leur première commande validée sur une tablette.'
                : 'Vérifiez l’orthographe ou cherchez avec le numéro de téléphone.'
            }
          />
        ) : (
          <>
            {/* Mobile list */}
            <ul className="md:hidden divide-y divide-slate-100">
              {filteredCustomers.map((cust) => (
                <li key={cust.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-semibold text-sm flex items-center justify-center shrink-0">
                      {cust.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{cust.full_name}</p>
                      <p className="text-xs text-slate-500">
                        {cust.total_orders} cmd · {formatDate(cust.last_visit)}
                      </p>
                    </div>
                  </div>
                  <a href={waLink(cust)} target="_blank" rel="noopener noreferrer" className={btn.ghost} aria-label="WhatsApp">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                  </a>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">WhatsApp</th>
                  <th className="px-5 py-3">Commandes</th>
                  <th className="px-5 py-3">Dernière visite</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-sm flex items-center justify-center">
                          {cust.full_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{cust.full_name}</p>
                          {cust.notes && <p className="text-xs text-slate-500">{cust.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{cust.whatsapp}</td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-slate-900">{cust.total_orders}</span>
                      {cust.total_orders >= 3 && <span className="ml-2 text-xs text-[#C2410C] font-semibold">Habitué</span>}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(cust.last_visit)}</td>
                    <td className="px-5 py-3 text-right">
                      <a href={waLink(cust)} target="_blank" rel="noopener noreferrer" className={btn.secondary + ' h-9'}>
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        Écrire sur WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Card>
    </PageContainer>
  );
}
