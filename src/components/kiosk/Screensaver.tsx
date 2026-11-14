'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { SCREENSAVER_IMAGES } from '@/lib/mock-data';
import { Sparkles } from 'lucide-react';
import { playTapSound } from '@/lib/sound';

interface ScreensaverProps {
  isOpen: boolean;
  onWake: () => void;
  tableNumber: number;
}

export const Screensaver: React.FC<ScreensaverProps> = ({ isOpen, onWake, tableNumber }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SCREENSAVER_IMAGES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentImage = SCREENSAVER_IMAGES[currentSlide];

  const handleWake = () => {
    playTapSound();
    onWake();
  };

  return (
    <div
      onClick={handleWake}
      onTouchStart={handleWake}
      className="fixed inset-0 z-50 bg-black overflow-hidden select-none cursor-pointer flex flex-col justify-between"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Background Slideshow with smooth transition */}
      {SCREENSAVER_IMAGES.map((img, index) => (
        <div
          key={img.url}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div
            className="w-full h-full bg-cover bg-center animate-ken-burns scale-105"
            style={{ backgroundImage: `url(${img.url})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
        </div>
      ))}

      {/* Top Brand Bar with Official Logo */}
      <div className="relative z-20 pt-3 sm:pt-6 px-4 sm:px-10 flex justify-between items-center w-full gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative h-12 sm:h-24 md:h-36 lg:h-48 w-40 sm:w-72 md:w-96 lg:w-[480px] flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="Mat House Restaurant"
              fill
              className="object-contain object-left filter drop-shadow-[0_6px_20px_rgba(212,175,55,0.6)]"
              priority
            />
          </div>
        </div>

        <div className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-black/70 border border-[#D4AF37]/40 backdrop-blur-md shadow-lg shrink-0 whitespace-nowrap">
          <span className="text-xs sm:text-sm font-bold tracking-wider text-[#D4AF37] uppercase whitespace-nowrap">
            Table {tableNumber}
          </span>
        </div>
      </div>

      {/* Middle Floating Dish Caption */}
      <div className="relative z-20 px-4 sm:px-8 md:px-12 max-w-2xl text-left my-auto py-2">
        <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] sm:text-xs font-bold mb-1.5 sm:mb-3 backdrop-blur-md">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />
          <span>Sélection Mat House</span>
        </div>
        <h2 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-1 sm:mb-2 drop-shadow-2xl leading-tight">
          {currentImage.title}
        </h2>
        <p className="text-xs sm:text-base md:text-lg text-slate-200 font-normal drop-shadow line-clamp-2">
          {currentImage.subtitle}
        </p>
      </div>

      {/* Bottom Wake Touch Prompt */}
      <div className="relative z-20 pb-4 sm:pb-8 md:pb-12 flex flex-col items-center px-4 w-full">
        <div className="animate-pulse-slow px-5 sm:px-8 py-2.5 sm:py-4 rounded-full bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1017] font-black text-xs sm:text-base md:text-xl shadow-gold-subtle border border-[#E5C158]/50 flex items-center space-x-2.5 sm:space-x-4 max-w-full">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0B1017] animate-ping shrink-0" />
          <span className="tracking-wide uppercase whitespace-nowrap">Touchez l&apos;écran pour commencer</span>
        </div>
        <p className="text-[10px] sm:text-xs text-slate-400 mt-2 sm:mt-4 tracking-widest uppercase font-mono">
          Mat House Restaurant &bull; Mode Kiosque Tactile
        </p>
      </div>
    </div>
  );
};
