'use client';

import React, { useState } from 'react';
import { useTabletStore } from '@/store/tabletStore';
import { Users, ArrowLeft, ArrowRight, Minus, Plus } from 'lucide-react';
import { playTapSound } from '@/lib/sound';

export const PeoplePicker: React.FC = () => {
  const { setPeopleCount, setActiveScreen } = useTabletStore();
  const [count, setCount] = useState<number>(4);

  const increment = () => {
    if (count < 12) {
      playTapSound();
      setCount((c) => c + 1);
    }
  };

  const decrement = () => {
    if (count > 2) {
      playTapSound();
      setCount((c) => c - 1);
    }
  };

  const selectDirect = (val: number) => {
    playTapSound();
    setCount(val);
  };

  const handleConfirm = () => {
    playTapSound();
    setPeopleCount(count);
    setActiveScreen('menu');
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-12 select-none overflow-y-auto bg-[#0B1017]">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121822] via-[#0B1017] to-[#080C12] opacity-95 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            playTapSound();
            setActiveScreen('welcome');
          }}
          className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-2 text-xs sm:text-sm font-bold border border-white/10 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>

        <div className="flex items-center space-x-2 text-[#D4AF37] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          <span>Étape 1 sur 2 : Vos Convives</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-xl mx-auto text-center my-auto py-3 sm:py-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mx-auto mb-3 sm:mb-4">
          <Users className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-1 sm:mb-2">
          Combien de personnes ?
        </h2>
        <p className="text-slate-400 text-xs sm:text-base mb-6 sm:mb-8 font-normal">
          Chaque personne pourra choisir ses propres plats et boissons.
        </p>

        {/* Large Tactile Stepper */}
        <div className="flex items-center justify-center space-x-4 sm:space-x-8 mb-6 sm:mb-8">
          <button
            onClick={decrement}
            disabled={count <= 2}
            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-black transition shadow-lg ${
              count <= 2
                ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                : 'bg-[#121822] hover:bg-[#1A2230] active:scale-95 text-white border border-white/10'
            }`}
          >
            <Minus className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>

          <div className="flex flex-col items-center justify-center min-w-[100px] sm:min-w-[140px]">
            <span className="text-6xl sm:text-8xl font-black text-white tracking-tight drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              {count}
            </span>
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-[#D4AF37] font-bold mt-1">
              {count === 1 ? 'Convive' : 'Personnes'}
            </span>
          </div>

          <button
            onClick={increment}
            disabled={count >= 12}
            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-black transition shadow-lg ${
              count >= 12
                ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                : 'bg-[#121822] hover:bg-[#1A2230] active:scale-95 text-white border border-white/10'
            }`}
          >
            <Plus className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* Quick Grid Selectors (2 to 12) - Capsule Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-md mx-auto mb-6 sm:mb-8">
          {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => {
            const isSelected = count === num;
            return (
              <button
                key={num}
                onClick={() => selectDirect(num)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-black text-sm sm:text-base transition border ${
                  isSelected
                    ? 'bg-[#D4AF37] text-[#0B1017] border-[#D4AF37] shadow-gold-subtle scale-105'
                    : 'bg-[#121822] text-slate-300 border-white/10 hover:border-[#D4AF37]/30 hover:text-white'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Big Confirm Button Capsule */}
        <button
          onClick={handleConfirm}
          className="w-full max-w-md min-h-[52px] sm:min-h-[60px] mx-auto py-3.5 sm:py-4 px-6 sm:px-8 rounded-full bg-[#D4AF37] hover:bg-[#E5C158] active:scale-[0.99] text-[#0B1017] font-black text-base sm:text-xl shadow-gold-subtle border border-[#E5C158]/50 flex items-center justify-center space-x-3 transition"
        >
          <span>Accéder au Menu ({count} personnes)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-slate-500">
        Vous pourrez modifier ce nombre ultérieurement si d&apos;autres convives vous rejoignent.
      </div>
    </div>
  );
};
