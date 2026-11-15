'use client';

import React, { useEffect, useState } from 'react';
import { useTabletStore } from '@/store/tabletStore';
import { 
  CheckCircle2, 
  Utensils, 
  Receipt, 
  Bell, 
  Clock, 
  Sparkles,
  HandPlatter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playTapSound } from '@/lib/sound';

export const OrderConfirmation: React.FC = () => {
  const { 
    config, 
    lastOrderNumber, 
    customerSession, 
    resetSessionForNewRound, 
    handBackToWaiter,
    requestBill, 
    callWaiter 
  } = useTabletStore();

  const [billRequested, setBillRequested] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#d97706', '#ffffff'],
      });
    } catch {
      // Ignore if canvas not supported
    }
  }, []);

  const handleOrderMore = () => {
    playTapSound();
    resetSessionForNewRound();
  };

  const handleHandBack = () => {
    playTapSound();
    handBackToWaiter();
  };

  const handleRequestBill = async () => {
    playTapSound();
    setBillRequested(true);
    await requestBill();
  };

  const handleCallStaff = async () => {
    playTapSound();
    setWaiterCalled(true);
    await callWaiter();
    setTimeout(() => setWaiterCalled(false), 4000);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-12 select-none overflow-y-auto bg-[#0B0E14] text-slate-100">
      {/* Background Ambience & Lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121824] via-[#0B0E14] to-[#080B10] opacity-95 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-widest shadow-emerald-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Commande transmise à la brigade</span>
        </div>

        <div className="px-4 py-1.5 rounded-full glass-panel text-[#E5C158] text-xs font-bold font-mono border border-[#D4AF37]/40 shadow-gold-subtle">
          TABLE {config.tableNumber}
        </div>
      </div>

      {/* Center Confirmation Card */}
      <div className="relative z-10 max-w-xl mx-auto my-auto text-center py-6 sm:py-8">
        <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4 sm:mb-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-pulse">
          <CheckCircle2 className="w-9 h-9 sm:w-13 sm:h-13" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-3 drop-shadow-lg">
          Commande confirmée !
        </h2>

        {lastOrderNumber && (
          <div className="inline-block mb-4">
            <span className="px-5 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0B0E14] font-mono font-extrabold text-sm sm:text-lg shadow-gold-subtle border border-[#F5E6B3]/60">
              COMMANDE N° {lastOrderNumber}
            </span>
          </div>
        )}

        <p className="text-slate-300 text-xs sm:text-base mb-6 sm:mb-8 max-w-md mx-auto font-light px-4 leading-relaxed">
          Merci {customerSession?.fullName ? <span className="font-bold text-[#D4AF37]">{customerSession.fullName}</span> : 'cher convive'}, notre chef et sa brigade préprérent soigneusement votre commande.
        </p>

        {/* Live Status Tracker Box */}
        <div className="glass-panel rounded-3xl border border-[#D4AF37]/30 p-5 sm:p-6 max-w-md mx-auto mb-6 sm:mb-8 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-widest font-semibold">Suivi Cuisine En Direct</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  En préparation au fourneau
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/10">~15 min</span>
          </div>

          <div className="pt-3.5 text-left">
            <p className="text-xs text-slate-300 flex items-center gap-2 font-light">
              <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span>
                Suivi disponible via WhatsApp au {customerSession?.whatsapp || 'numéro renseigné'}.
              </span>
            </p>
          </div>
        </div>

        {/* Main action: give the tablet back to the waitress */}
        <button
          onClick={handleHandBack}
          className="w-full max-w-md mx-auto mb-3.5 min-h-[60px] py-4 px-6 rounded-full bg-[#E85D04] hover:bg-[#F06A10] text-white font-extrabold text-sm sm:text-base shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
        >
          <HandPlatter className="w-5 h-5" />
          <span>C’est terminé : rendre la tablette au serveur</span>
        </button>

        {/* Action Capsule Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-md mx-auto">
          {/* Commander autre chose */}
          <button
            onClick={handleOrderMore}
            className="shimmer-effect min-h-[52px] sm:min-h-[56px] py-3.5 px-6 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#E5C158] hover:to-[#F5E6B3] text-[#0B0E14] font-extrabold text-xs sm:text-sm shadow-gold-subtle flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] border border-[#F5E6B3]/60"
          >
            <Utensils className="w-4 h-4 font-bold" />
            <span>Ajouter d&apos;autres plats</span>
          </button>

          {/* Demander l'addition */}
          <button
            onClick={handleRequestBill}
            disabled={billRequested}
            className={`min-h-[52px] sm:min-h-[56px] py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm border flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] ${
              billRequested
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20'
                : 'bg-white/5 hover:bg-white/10 text-white border-white/15'
            }`}
          >
            <Receipt className={`w-4 h-4 ${billRequested ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{billRequested ? 'Addition demandée !' : 'Demander l\'addition'}</span>
          </button>
        </div>

        {/* Secondary Action: Call Waiter */}
        <div className="mt-4">
          <button
            onClick={handleCallStaff}
            className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 py-2 px-5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            <Bell className="w-4 h-4 text-[#D4AF37]" />
            <span>{waiterCalled ? 'Serveur prévenu...' : 'Besoin d\'assistance ? Appeler un serveur'}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-slate-500 font-light">
        RestoTablet Pro &bull; Mat House Restaurant
      </div>
    </div>
  );
};
