'use client';

import React, { useEffect, useState } from 'react';
import { Download, CheckCircle2, Share, PlusSquare, X, MoreVertical } from 'lucide-react';
import { canPromptInstall, isInstalled, isIOS, onInstallStateChange, promptInstall } from '@/lib/pwa';

interface InstallAppButtonProps {
  /** Visual style: dark kiosk panel or admin sidebar */
  variant?: 'kiosk' | 'sidebar';
}

/**
 * "Install the app" button.
 * - Chrome / Edge / Android: opens the browser's install dialog.
 * - iPad / iPhone (Safari): shows the 2 steps to add it to the home screen.
 * - Other cases: explains where to find "Install" in the browser menu.
 */
export const InstallAppButton: React.FC<InstallAppButtonProps> = ({ variant = 'kiosk' }) => {
  const [installed, setInstalled] = useState(false);
  const [promptReady, setPromptReady] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const sync = () => {
      setInstalled(isInstalled());
      setPromptReady(canPromptInstall());
    };
    setIos(isIOS());
    sync();
    return onInstallStateChange(sync);
  }, []);

  const handleClick = async () => {
    if (installed) return;
    if (promptReady) {
      const ok = await promptInstall();
      if (ok) setInstalled(true);
      return;
    }
    setShowHelp(true);
  };

  const label = installed ? 'Application installée' : 'Installer l’application';

  const button =
    variant === 'sidebar' ? (
      <button
        type="button"
        onClick={handleClick}
        disabled={installed}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition disabled:opacity-60 disabled:hover:bg-transparent"
        title="Ajouter Mat House à l’écran d’accueil de cet appareil"
      >
        {installed ? <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400" /> : <Download className="w-[18px] h-[18px]" />}
        <span>{label}</span>
      </button>
    ) : (
      <button
        type="button"
        onClick={handleClick}
        disabled={installed}
        className="p-3 rounded-2xl bg-[#1A2230]/60 hover:bg-[#1A2230] border border-white/10 flex flex-col items-center justify-center text-center transition disabled:opacity-70"
      >
        {installed ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1" />
        ) : (
          <Download className="w-5 h-5 text-[#D4AF37] mb-1" />
        )}
        <span className="text-xs font-semibold text-white">{installed ? 'App installée' : 'Installer l’app'}</span>
      </button>
    );

  return (
    <>
      {button}

      {showHelp && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-help-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white text-slate-900 rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/pwa-192.png" alt="" className="w-12 h-12 rounded-xl" />
                <div>
                  <h3 id="install-help-title" className="text-base font-semibold">
                    Installer Mat House
                  </h3>
                  <p className="text-xs text-slate-500">L’app s’ouvrira en plein écran, comme une vraie application.</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {ios ? (
              <ol className="mt-5 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <span>
                    Touchez le bouton <strong>Partager</strong>{' '}
                    <Share className="inline w-4 h-4 -mt-0.5 text-sky-600" /> dans la barre de Safari.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <span>
                    Choisissez <strong>Sur l’écran d’accueil</strong>{' '}
                    <PlusSquare className="inline w-4 h-4 -mt-0.5" />, puis <strong>Ajouter</strong>.
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="mt-5 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <span>
                    Ouvrez le menu du navigateur <MoreVertical className="inline w-4 h-4 -mt-0.5" /> (en haut à droite).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <span>
                    Choisissez <strong>Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong>.
                  </span>
                </li>
              </ol>
            )}

            <p className="mt-5 text-xs text-slate-500">
              Utilisez Chrome sur Android, Safari sur iPad/iPhone, ou Chrome/Edge sur ordinateur.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
