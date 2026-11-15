'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, ExternalLink, BedDouble, Building2 } from 'lucide-react';
import { APARTMENTS, ROOMS, Place } from '@/lib/places';
import { Card, PageContainer, PageHeader, btn } from '@/components/admin/ui';

/** Public address printed in the QR codes. */
const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');

const orderUrl = (p: Place) => `${siteUrl()}/commande/${p.slug}`;

export default function QrCodesPage() {
  const [codes, setCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    const all = [...ROOMS, ...APARTMENTS];
    Promise.all(
      all.map((p) =>
        QRCode.toDataURL(orderUrl(p), {
          width: 640,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#14171F', light: '#FFFFFF' },
        }).then((url) => [p.slug, url] as const)
      )
    ).then((pairs) => setCodes(Object.fromEntries(pairs)));
  }, []);

  const renderGroup = (title: string, icon: React.ReactNode, places: Place[]) => (
    <section className="mb-8 print:mb-0">
      <h2 className="no-print flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
        {icon}
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 print:grid-cols-2 print:gap-6">
        {places.map((p) => (
          <Card key={p.slug} className="qr-card overflow-hidden flex flex-col">
            {/* Printed part */}
            <div className="flex flex-col items-center text-center px-5 pt-5 pb-4">
              <div className="w-full rounded-lg bg-[#14171F] py-3 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-cropped.png" alt="Mat House Restaurant" className="h-9 object-contain" />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C2410C]">Room service</p>
              <p className="text-2xl font-bold text-slate-900 leading-tight">{p.label}</p>
              <div className="mt-3 w-full max-w-[220px] aspect-square rounded-lg border border-slate-200 bg-white p-2 flex items-center justify-center">
                {codes[p.slug] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={codes[p.slug]} alt={`QR code ${p.label}`} className="w-full h-full" />
                ) : (
                  <span className="text-xs text-slate-400">Génération…</span>
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800">Scannez pour commander</p>
              <p className="text-xs text-slate-500 max-w-[230px]">
                Ouvrez l’appareil photo de votre téléphone et visez le code. Votre commande vous est apportée.
              </p>
            </div>
            {/* Screen-only actions */}
            <div className="no-print mt-auto px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
              <a
                href={orderUrl(p)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 truncate"
                title="Tester le lien"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">/commande/{p.slug}</span>
              </a>
              {codes[p.slug] && (
                <a href={codes[p.slug]} download={`QR-${p.slug}.png`} className={`${btn.ghost} h-8 px-2`} title="Télécharger l’image">
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );

  return (
    <PageContainer>
      <div className="no-print">
        <PageHeader
          title="QR codes"
          description="Un QR code par chambre et par appartement. Le client le scanne avec son téléphone et commande directement : la commande arrive en cuisine avec le nom du logement."
          actions={
            <button onClick={() => window.print()} className={btn.primary}>
              <Printer className="w-4 h-4" />
              Imprimer tous les QR codes
            </button>
          }
        />
        <p className="-mt-3 mb-6 text-xs text-slate-500">
          Adresse utilisée dans les codes : <span className="font-mono text-slate-700">{siteUrl() || '…'}</span>. Si vous
          changez un jour d’adresse de site, réimprimez les codes.
        </p>
      </div>

      {renderGroup('Chambres', <BedDouble className="w-4 h-4" />, ROOMS)}
      {renderGroup('Appartements', <Building2 className="w-4 h-4" />, APARTMENTS)}
    </PageContainer>
  );
}
