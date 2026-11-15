'use client';

import React from 'react';
import { TableStatus } from '@/types';

/**
 * Shared building blocks for the admin console.
 * Light, sober "back-office" look: white cards on a light grey canvas,
 * one brand colour (orange) for primary actions, plain-language labels.
 */

export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-[#E85D04] hover:bg-[#D45303] text-white text-sm font-semibold shadow-sm transition active:scale-[0.98] disabled:opacity-50 whitespace-nowrap',
  secondary:
    'inline-flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-300 shadow-sm transition active:scale-[0.98] disabled:opacity-50 whitespace-nowrap',
  ghost:
    'inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium transition whitespace-nowrap',
  danger:
    'inline-flex items-center justify-center gap-2 px-3 h-9 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition active:scale-[0.98] whitespace-nowrap',
  success:
    'inline-flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition active:scale-[0.98] whitespace-nowrap',
};

export const inputClass =
  'w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#E85D04] focus:ring-2 focus:ring-[#E85D04]/20 transition';

export const PageHeader: React.FC<{
  title: string;
  description: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}> = ({ title, description, actions, meta }) => (
  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
    <div className="min-w-0">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {meta}
      </div>
      <p className="text-sm text-slate-500 mt-1 max-w-2xl">{description}</p>
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, description, icon, action }) => (
  <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200">
    <div className="flex items-start gap-3 min-w-0">
      {icon && (
        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
    {action}
  </div>
);

export const CountPill: React.FC<{ children: React.ReactNode; tone?: 'neutral' | 'brand' | 'danger' | 'success' }> = ({
  children,
  tone = 'neutral',
}) => {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    brand: 'bg-orange-50 text-[#C2410C] border-orange-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tones[tone]}`}>
      {children}
    </span>
  );
};

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; hint?: string }> = ({ icon, title, hint }) => (
  <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
    {icon && <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">{icon}</div>}
    <p className="text-sm font-semibold text-slate-700">{title}</p>
    {hint && <p className="text-xs text-slate-500 mt-1 max-w-sm">{hint}</p>}
  </div>
);

/** One place that defines how each table status is named and coloured. */
export const TABLE_STATUS: Record<
  TableStatus,
  { label: string; help: string; dot: string; badge: string; card: string }
> = {
  libre: {
    label: 'Libre',
    help: 'Aucun client à cette table',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    card: 'border-slate-200',
  },
  occupee: {
    label: 'Occupée',
    help: 'Clients installés',
    dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    card: 'border-sky-200',
  },
  serveur_appele: {
    label: 'Appel serveur',
    help: 'Un client demande un serveur',
    dot: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    card: 'border-rose-300 ring-2 ring-rose-100',
  },
  addition_demandee: {
    label: 'Addition demandée',
    help: 'Apporter l’addition',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    card: 'border-amber-300 ring-2 ring-amber-100',
  },
};

export const StatusBadge: React.FC<{ status: TableStatus }> = ({ status }) => {
  const s = TABLE_STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

export const StatusLegend: React.FC = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
    {(Object.keys(TABLE_STATUS) as TableStatus[]).map((k) => (
      <span key={k} className="inline-flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${TABLE_STATUS[k].dot}`} />
        <span className="font-medium text-slate-700">{TABLE_STATUS[k].label}</span>
        <span className="hidden xl:inline">— {TABLE_STATUS[k].help}</span>
      </span>
    ))}
  </div>
);

/** Accessible on/off switch used for dish availability. */
export const AvailabilitySwitch: React.FC<{ available: boolean; onToggle: () => void; compact?: boolean }> = ({
  available,
  onToggle,
  compact,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={available}
    onClick={onToggle}
    className="inline-flex items-center gap-2 group shrink-0"
    title={available ? 'Disponible : touchez pour mettre en rupture' : 'En rupture : touchez pour remettre en vente'}
  >
    <span
      className={`relative w-10 h-6 rounded-full transition-colors ${available ? 'bg-emerald-500' : 'bg-slate-300'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          available ? 'translate-x-4' : ''
        }`}
      />
    </span>
    {!compact && (
      <span className={`text-xs font-semibold w-16 text-left ${available ? 'text-emerald-700' : 'text-slate-500'}`}>
        {available ? 'Disponible' : 'En rupture'}
      </span>
    )}
  </button>
);

export { formatMoney, formatTotals } from '@/lib/money';

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 md:pb-10 ${className}`}>{children}</div>
);
