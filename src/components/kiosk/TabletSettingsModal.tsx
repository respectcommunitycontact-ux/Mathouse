'use client';

import React, { useState, useEffect } from 'react';
import { useTabletStore } from '@/store/tabletStore';
import { 
  Settings, 
  Wifi, 
  Battery, 
  Maximize2, 
  RefreshCw, 
  X, 
  Check, 
  KeyRound, 
  LayoutDashboard,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { playTapSound } from '@/lib/sound';
import { enterFullscreen, exitFullscreen, isFullscreen as isFs } from '@/lib/pwa';
import { InstallAppButton } from '@/components/InstallAppButton';

interface TabletSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TabletSettingsModal: React.FC<TabletSettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, setTableNumber, fullResetSession, setScreensaver } = useTabletStore();

  const [selectedTable, setSelectedTable] = useState(config.tableNumber);
  const [wifiSsid, setWifiSsid] = useState(config.wifiSsid);
  const [wifiPassword, setWifiPassword] = useState(config.wifiPassword || '');
  const [pinCode, setPinCode] = useState(config.pinCode);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const nav = navigator as unknown as { getBattery?: () => Promise<{ level: number }> };
      if (nav.getBattery) {
        nav.getBattery().then((battery) => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }

      setIsFullscreen(isFs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    playTapSound();
    setTableNumber(selectedTable);
    updateConfig({
      wifiSsid,
      wifiPassword,
      pinCode,
    });
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 800);
  };

  const toggleFullscreen = () => {
    playTapSound();
    if (!isFs()) {
      enterFullscreen();
      setIsFullscreen(true);
    } else {
      exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const triggerFastScreensaver = () => {
    onClose();
    setTimeout(() => {
      setScreensaver(true);
    }, 300);
  };

  const tableList = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 select-none">
      <div className="bg-[#121822] border border-[#D4AF37]/30 w-full max-w-2xl max-h-[90vh] rounded-3xl p-6 md:p-8 flex flex-col shadow-2xl overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-5 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Paramètres Kiosque Tablette
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Manager
                </span>
              </h2>
              <p className="text-xs text-slate-400">ID Tablette: {config.tabletId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-6">
          {/* SECTION 1: Numéro de Table */}
          <div>
            <label className="text-sm font-semibold text-[#D4AF37] mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              1. Choisir le Numéro de Table affecté à cette tablette
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {tableList.map((num) => {
                const isSelected = selectedTable === num;
                return (
                  <button
                    key={num}
                    onClick={() => {
                      playTapSound();
                      setSelectedTable(num);
                    }}
                    className={`h-12 rounded-xl font-bold text-sm flex items-center justify-center transition border ${
                      isSelected
                        ? 'bg-[#D4AF37] text-[#0B1017] border-[#D4AF37] shadow-gold-subtle scale-105 font-black'
                        : 'bg-[#1A2230] text-slate-300 border-white/10 hover:border-[#D4AF37]/30 hover:text-white'
                    }`}
                  >
                    T {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Configuration WiFi & Sécurité PIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1A2230]/60 p-4 rounded-2xl border border-white/10">
              <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-[#D4AF37]" />
                Réseau WiFi Restaurant
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nom du WiFi (SSID)"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[#0B1017] border border-white/10 text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <input
                  type="password"
                  placeholder="Mot de passe WiFi"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[#0B1017] border border-white/10 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="bg-[#1A2230]/60 p-4 rounded-2xl border border-white/10">
              <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                Code PIN Manager (4 chiffres)
              </label>
              <input
                type="text"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 text-sm rounded-xl bg-[#0B1017] border border-white/10 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-[#D4AF37]"
              />
              <p className="text-[11px] text-slate-500 mt-2">Utilisé pour déverrouiller ce panneau (Défaut: 1234)</p>
            </div>
          </div>

          {/* SECTION 3: Kiosk Utilities & Diagnostics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <InstallAppButton variant="kiosk" />
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-2xl bg-[#1A2230]/60 hover:bg-[#1A2230] border border-white/10 flex flex-col items-center justify-center text-center transition"
            >
              <Maximize2 className="w-5 h-5 text-[#D4AF37] mb-1" />
              <span className="text-xs font-semibold text-white">
                {isFullscreen ? 'Quitter Plein Écran' : 'Mode Plein Écran'}
              </span>
            </button>

            <button
              onClick={triggerFastScreensaver}
              className="p-3 rounded-2xl bg-[#1A2230]/60 hover:bg-[#1A2230] border border-white/10 flex flex-col items-center justify-center text-center transition"
            >
              <ShieldCheck className="w-5 h-5 text-[#D4AF37] mb-1" />
              <span className="text-xs font-semibold text-white">Tester Veille (Attract)</span>
            </button>

            <button
              onClick={() => {
                playTapSound();
                fullResetSession();
                onClose();
              }}
              className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex flex-col items-center justify-center text-center transition"
            >
              <RefreshCw className="w-5 h-5 text-rose-400 mb-1" />
              <span className="text-xs font-semibold text-rose-300">Reset Session Table</span>
            </button>

            <div className="p-3 rounded-2xl bg-[#1A2230]/60 border border-white/10 flex flex-col items-center justify-center text-center">
              <Battery className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-xs font-semibold text-white">
                Batterie : {batteryLevel !== null ? `${batteryLevel}%` : 'En charge'}
              </span>
            </div>
          </div>

          {/* Fast Link to Admin Cuisine */}
          <div className="pt-2">
            <Link
              href="/admin/cuisine"
              target="_blank"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#1A2230] hover:bg-[#222C3E] border border-[#D4AF37]/30 text-[#D4AF37] font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />
              <span>Ouvrir l&apos;Écran Cuisine / Admin (Dashboard Kanban) &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-full bg-white/5 text-slate-300 text-sm font-semibold hover:bg-white/10 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-full bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1017] text-sm font-black shadow-gold-subtle flex items-center gap-2 transition border border-[#E5C158]/50"
          >
            {saveToast ? (
              <>
                <Check className="w-4 h-4 text-[#0B1017]" />
                Enregistré !
              </>
            ) : (
              'Enregistrer les Paramètres'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
