'use client';

import React from 'react';
import { useCartStore } from '@/store/cartStore';
import { useTabletStore } from '@/store/tabletStore';
import { ShoppingBag, ChevronUp, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { playTapSound } from '@/lib/sound';
import { formatMoney, formatTotals, sumMoney } from '@/lib/money';

export const FloatingCart: React.FC = () => {
  const { 
    items, 
    isDrawerOpen, 
    setDrawerOpen, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotals, 
    getTotalItems,
    getItemsByPerson 
  } = useCartStore();

  const { setActiveScreen } = useTabletStore();

  const totalItems = getTotalItems();
  const totalLabel = formatTotals(getTotals());
  const groupedByPerson = getItemsByPerson();

  if (totalItems === 0) return null;

  const handleOpenCheckout = () => {
    playTapSound();
    setDrawerOpen(false);
    setActiveScreen('checkout');
  };

  return (
    <>
      {/* 1. BOTTOM FLOATING BAR (ALWAYS PINNED) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-5 pointer-events-none select-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div 
            onClick={() => {
              playTapSound();
              setDrawerOpen(true);
            }}
            className="glass-panel border border-[#D4AF37]/40 hover:border-[#D4AF37]/80 rounded-full p-2.5 sm:p-3.5 shadow-2xl flex items-center justify-between cursor-pointer transition-all duration-300 active:scale-[0.99] glow-gold"
          >
            {/* Left: Bag Icon & Item Count */}
            <div className="flex items-center space-x-3 sm:space-x-4 pl-2">
              <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0B0E14] flex items-center justify-center font-black shadow-gold-subtle shrink-0">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[#0B0E14] text-xs font-black flex items-center justify-center border-2 border-[#0B0E14] shadow-md">
                  {totalItems}
                </span>
              </div>
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#D4AF37] font-extrabold flex items-center gap-1">
                  <span>Voir la commande</span>
                  <ChevronUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                </span>
                <p className="text-xs sm:text-base font-bold text-white">
                  {totalItems} {totalItems === 1 ? 'plat sélectionné' : 'plats sélectionnés'}
                </p>
              </div>
            </div>

            {/* Right: Total Price & Quick Action Button */}
            <div className="flex items-center space-x-3 sm:space-x-5 md:space-x-7 pr-1">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Total</span>
                <span className="text-lg sm:text-2xl md:text-3xl font-serif font-extrabold text-[#D4AF37] gold-gradient-text">
                  {totalLabel}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCheckout();
                }}
                className="shimmer-effect min-h-[44px] sm:min-h-[50px] px-5 sm:px-8 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#E5C158] hover:to-[#F5E6B3] text-[#0B0E14] font-extrabold text-xs sm:text-sm shadow-gold-subtle hover:shadow-gold-lg flex items-center gap-2 transition-all duration-300 border border-[#F5E6B3]/60 active:scale-95 shrink-0"
              >
                <span>Commander</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXPANDABLE CART DRAWER MODAL */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex justify-end select-none animate-fade-in">
          <div className="w-full max-w-xl bg-[#121824] h-full border-l border-[#D4AF37]/30 flex flex-col justify-between shadow-2xl">
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between glass-panel">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-gold-subtle">
                  <ShoppingBag className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">Récapitulatif de la table</h3>
                  <p className="text-xs text-slate-400 font-light">Répartition détaillée convive par convive</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    playTapSound();
                    clearCart();
                  }}
                  className="p-2.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Vider le panier"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    playTapSound();
                    setDrawerOpen(false);
                  }}
                  className="p-2.5 rounded-full bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Scrollable Content: Grouped by Person */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {Object.entries(groupedByPerson).map(([personLabel, personItems]) => {
                const personSubtotal = formatTotals(
                  sumMoney(personItems.map((it) => ({ price: it.menu_item.price, quantity: it.quantity, currency: it.menu_item.currency })))
                );

                return (
                  <div
                    key={personLabel}
                    className="glass-panel rounded-3xl border border-[#D4AF37]/20 p-5 space-y-4 shadow-xl"
                  >
                    {/* Person Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-white/[0.08]">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-sm font-extrabold text-[#D4AF37] flex items-center gap-1.5">
                          <span>{personLabel === 'Toute la table' ? '🍽️' : '👤'}</span>
                          <span>{personLabel}</span>
                        </span>
                        <span className="text-[11px] px-3 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#E5C158] font-bold border border-[#D4AF37]/30">
                          {personItems.reduce((acc, it) => acc + it.quantity, 0)} plats
                        </span>
                      </div>
                      <span className="text-base font-serif font-extrabold text-white">
                        {personSubtotal}
                      </span>
                    </div>

                    {/* Person Items List */}
                    <div className="space-y-3">
                      {personItems.map((it) => (
                        <div
                          key={it.cart_id}
                          className="flex items-center justify-between gap-3 bg-[#0B0E14] p-3.5 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all"
                        >
                          <div className="flex-1">
                            <h5 className="text-sm font-bold text-white font-serif leading-tight">
                              {it.menu_item.name}
                            </h5>
                            <span className="text-xs text-slate-400 font-mono">
                              {formatMoney(it.menu_item.price, it.menu_item.currency)} l&apos;unité
                            </span>
                            {it.special_instructions && (
                              <p className="text-[11px] text-amber-300/90 italic mt-1 font-light">
                                Remarque : {it.special_instructions}
                              </p>
                            )}
                          </div>

                          {/* Stepper +/- Capsule */}
                          <div className="flex items-center space-x-2 bg-[#1C2536] rounded-full px-2.5 py-1 border border-white/10 shadow-inner">
                            <button
                              onClick={() => updateQuantity(it.cart_id, -1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition active:scale-90"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-5 text-center font-mono font-extrabold text-xs text-white">
                              {it.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(it.cart_id, 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition active:scale-90"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => removeItem(it.cart_id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 bg-[#0B0E14] border-t border-white/[0.08] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Général TTC</span>
                <span className="text-2xl sm:text-3xl font-serif font-extrabold text-[#D4AF37] gold-gradient-text">
                  {totalLabel}
                </span>
              </div>

              <button
                onClick={handleOpenCheckout}
                className="w-full shimmer-effect min-h-[56px] py-4 px-6 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#E5C158] hover:to-[#F5E6B3] text-[#0B0E14] font-extrabold text-base sm:text-lg shadow-gold-subtle hover:shadow-gold-lg flex items-center justify-center space-x-3 transition-all duration-300 active:scale-[0.99] border border-[#F5E6B3]/60"
              >
                <span>Valider la commande &amp; Envoyer en cuisine</span>
                <ArrowRight className="w-5 h-5 font-bold" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
