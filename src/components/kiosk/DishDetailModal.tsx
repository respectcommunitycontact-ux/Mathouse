'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem } from '@/types';
import { useTabletStore } from '@/store/tabletStore';
import { useCartStore } from '@/store/cartStore';
import { X, Plus, Minus, Check, Clock, Sparkles } from 'lucide-react';
import { playTapSound } from '@/lib/sound';

interface DishDetailModalProps {
  dish: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({ dish, isOpen, onClose }) => {
  const { peopleCount, selectedGuestForAdd, setSelectedGuestForAdd } = useTabletStore();
  const { addItem } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedGuest, setSelectedGuest] = useState(selectedGuestForAdd || 'Personne 1');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSpecialInstructions('');
      setAddedToast(false);
      setSelectedGuest(selectedGuestForAdd || 'Personne 1');
    }
  }, [isOpen, selectedGuestForAdd]);

  if (!isOpen || !dish) return null;

  const guestOptions = peopleCount > 1
    ? [
        ...Array.from({ length: peopleCount }, (_, i) => `Personne ${i + 1}`),
        'Toute la table',
      ]
    : ['Personne 1'];

  const handleAddToCart = () => {
    playTapSound();
    addItem(dish, quantity, selectedGuest, specialInstructions.trim() || undefined);
    setSelectedGuestForAdd(selectedGuest); // Remember for next dish
    setAddedToast(true);

    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 500);
  };

  const totalPrice = (dish.price * quantity).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 select-none animate-fade-in">
      <div className="bg-[#121824] border border-[#D4AF37]/30 w-full max-w-2xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Image Header with Close Button */}
        <div className="relative h-48 sm:h-72 md:h-84 w-full overflow-hidden bg-[#0B0E14] flex-shrink-0">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url(${dish.image_url})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-[#121824]/40 to-black/70" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/70 backdrop-blur-md text-slate-200 hover:text-white hover:bg-black/90 flex items-center justify-center transition border border-white/20 shadow-xl"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category & Prep Time Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0B0E14] text-xs font-extrabold uppercase tracking-wider shadow-gold-subtle">
              {dish.category}
            </span>
            {dish.preparation_time_minutes && (
              <span className="px-3 py-1 rounded-full bg-black/70 text-slate-200 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 border border-white/15 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{dish.preparation_time_minutes} min</span>
              </span>
            )}
          </div>

          {/* Dish title overlay on image */}
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end gap-3">
            <div>
              <h3 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-tight drop-shadow-md">
                {dish.name}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xl sm:text-3xl font-serif font-extrabold text-[#D4AF37] gold-gradient-text">
                {dish.price.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Description & Tags */}
          <div>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              {dish.description}
            </p>
            {dish.tags && dish.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {dish.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#E5C158] text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SELECTION: Pour qui ? (Convive) */}
          <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/25 shadow-lg">
            <label className="text-xs font-extrabold uppercase tracking-widest text-[#D4AF37] block mb-3">
              Attribuer ce plat à :
            </label>
            <div className="flex flex-wrap gap-2.5">
              {guestOptions.map((opt) => {
                const isSelected = selectedGuest === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      playTapSound();
                      setSelectedGuest(opt);
                    }}
                    className={`min-h-[44px] px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 border flex items-center gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0B0E14] border-[#F5E6B3]/60 shadow-gold-subtle font-extrabold scale-105'
                        : 'bg-[#121824] text-slate-300 border-white/10 hover:border-[#D4AF37]/40 hover:text-white'
                    }`}
                  >
                    <span>{opt === 'Toute la table' ? '🍽️' : '👤'}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Instructions (Optional) */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">
              Remarques particulières pour la cuisine (optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex: Cuisson saignante, sauce à part, allergies..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-[#0B0E14] border border-white/15 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300"
            />
          </div>
        </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="p-4 sm:p-6 bg-[#0B0E14] border-t border-white/[0.08] flex items-center justify-between gap-3 sm:gap-4">
          {/* Quantity Stepper Capsule */}
          <div className="flex items-center space-x-2 bg-[#1C2536] px-3 py-1.5 rounded-full border border-white/15 shrink-0 shadow-inner">
            <button
              onClick={() => {
                if (quantity > 1) {
                  playTapSound();
                  setQuantity((q) => q - 1);
                }
              }}
              disabled={quantity <= 1}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base font-bold transition active:scale-90 ${
                quantity <= 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-base sm:text-lg font-extrabold font-mono text-white">
              {quantity}
            </span>
            <button
              onClick={() => {
                playTapSound();
                setQuantity((q) => q + 1);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center text-base font-bold transition active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Big Add Button Capsule */}
          <button
            onClick={handleAddToCart}
            disabled={!dish.is_available}
            className={`flex-1 shimmer-effect min-h-[50px] sm:min-h-[56px] py-3 px-6 rounded-full font-extrabold text-xs sm:text-base flex items-center justify-center gap-2 shadow-2xl transition-all duration-300 active:scale-[0.98] border ${
              dish.is_available
                ? addedToast
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#E5C158] hover:to-[#F5E6B3] text-[#0B0E14] shadow-gold-subtle hover:shadow-gold-lg border-[#F5E6B3]/60'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border-transparent'
            }`}
          >
            {addedToast ? (
              <>
                <Check className="w-5 h-5 text-[#0B0E14]" />
                <span>Ajouté au panier !</span>
              </>
            ) : dish.is_available ? (
              <>
                <span>Ajouter ({selectedGuest})</span>
                <span>&bull;</span>
                <span>{totalPrice} €</span>
              </>
            ) : (
              <span>Plat indisponible</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
