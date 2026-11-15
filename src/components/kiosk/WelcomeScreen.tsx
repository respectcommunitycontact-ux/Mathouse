'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTabletStore } from '@/store/tabletStore';
import { User, Users, Bell, Sparkles, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { playTapSound } from '@/lib/sound';
import { enterFullscreen } from '@/lib/pwa';

export const WelcomeScreen: React.FC = () => {
  const { config, setPeopleCount, setActiveScreen, callWaiter } = useTabletStore();
  const [waiterCalled, setWaiterCalled] = useState(false);

  const handleSolo = () => {
    playTapSound();
    enterFullscreen();
    setPeopleCount(1);
    setActiveScreen('menu');
  };

  const handleGroup = () => {
    playTapSound();
    enterFullscreen();
    setActiveScreen('people-picker');
  };

  const handleCallStaff = async () => {
    playTapSound();
    setWaiterCalled(true);
    await callWaiter();
    setTimeout(() => setWaiterCalled(false), 4000);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 md:px-12 md:py-6 select-none overflow-hidden bg-[#0B0E14] text-slate-100">
      {/* Ambient Restaurant Background Photography */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 filter blur-[2px] scale-105 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/85 to-[#0B0E14]/70 pointer-events-none" />
      
      {/* Luxury Gold Lighting Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#D4AF37]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header Bar: Logo + Table Badge + Waiter Call */}
      <div className="relative z-10 flex justify-between items-center w-full gap-4 shrink-0">
        <div className="relative h-12 sm:h-16 md:h-20 w-36 sm:w-60 md:w-72 flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="Mat House Restaurant"
            fill
            className="object-contain object-left filter drop-shadow-[0_4px_16px_rgba(212,175,55,0.4)]"
            priority
          />
        </div>

        {/* Right Header Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-full bg-[#141B28]/90 border border-[#D4AF37]/35 text-[#E5C158] font-extrabold text-xs sm:text-sm tracking-wider shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span>Table {config.tableNumber}</span>
          </div>

          <button
            onClick={handleCallStaff}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-md backdrop-blur-xl shrink-0 ${
              waiterCalled
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 animate-pulse'
                : 'bg-[#141B28]/80 hover:bg-[#1C2638] text-slate-200 border-white/10 hover:border-[#D4AF37]/40 active:scale-95'
            }`}
          >
            <Bell className={`w-4 h-4 shrink-0 ${waiterCalled ? 'text-emerald-400 rotate-12' : 'text-[#D4AF37]'}`} />
            <span className="hidden sm:inline">{waiterCalled ? 'Serveur Prévenu' : 'Appeler Serveur'}</span>
          </button>
        </div>
      </div>

      {/* Main Centered Ergonomic Welcome Card */}
      <div className="relative z-10 max-w-3xl w-full mx-auto my-auto flex flex-col items-center justify-center text-center px-4 py-6">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#E5C158] text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Expérience Gastronomique Tactile</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white tracking-tight mb-3 font-semibold drop-shadow-md">
          Bienvenue à votre table
        </h1>

        <p className="text-slate-300 text-xs sm:text-base font-light max-w-lg mx-auto mb-8 leading-relaxed">
          Découvrez notre carte d&apos;exception et composez vos commandes en toute simplicité.
        </p>

        {/* 2 Big Ergonomic Action Cards Centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl mx-auto">
          {/* Option 1: Commander pour 1 */}
          <button
            onClick={handleSolo}
            className="group bg-[#121722]/90 hover:bg-[#182030] active:scale-[0.98] border border-white/10 hover:border-[#D4AF37]/50 rounded-3xl p-5 sm:p-6 transition-all duration-300 flex items-center justify-between shadow-2xl backdrop-blur-xl text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#E5C158] shrink-0 group-hover:scale-105 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-bold text-white group-hover:text-[#E5C158] transition-colors">
                  Commander pour 1
                </span>
                <span className="text-xs text-slate-400 font-light block mt-0.5">
                  Menu individuel solo
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#D4AF37] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>

          {/* Option 2: Commander à plusieurs */}
          <button
            onClick={handleGroup}
            className="group shimmer-effect bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#E5C158] hover:to-[#F5E6B3] active:scale-[0.98] text-[#0B0E14] font-extrabold rounded-3xl p-5 sm:p-6 transition-all duration-300 flex items-center justify-between shadow-lg hover:shadow-xl border border-[#F5E6B3]/60 text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0B0E14]/15 border border-[#0B0E14]/20 flex items-center justify-center text-[#0B0E14] shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-extrabold text-[#0B0E14]">
                  Commander à plusieurs
                </span>
                <span className="text-xs text-[#0B0E14]/80 font-semibold block mt-0.5">
                  Par convive (2 à 12 pers)
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#0B0E14] shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400/80 border-t border-white/[0.08] pt-3 shrink-0">
        <span className="font-serif italic text-slate-300">MAT HOUSE RESTAURANT &bull; Grande Gastronomie &amp; Service d&apos;Exception</span>
        <span className="mt-1 sm:mt-0 font-mono text-[11px] text-slate-500">RestoTablet Pro &bull; Kiosque Tablette</span>
      </div>
    </div>
  );
};
