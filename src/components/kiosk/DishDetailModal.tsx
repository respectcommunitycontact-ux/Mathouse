'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem } from '@/types';
import { useTabletStore } from '@/store/tabletStore';
import { useCartStore } from '@/store/cartStore';
import { X, Plus, Minus, Check, Flame, Leaf, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { playTapSound } from '@/lib/sound';
import { formatMoney } from '@/lib/money';
import confetti from 'canvas-confetti';

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
  const [isOrdered, setIsOrdered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSpecialInstructions('');
      setIsOrdered(false);
      setSelectedGuest(selectedGuestForAdd || 'Personne 1');
    }
  }, [isOpen, selectedGuestForAdd]);

  if (!isOpen || !dish) return null;

  const isVegetarian = dish.tags?.some((t) => /végé/i.test(t)) || dish.name.toLowerCase().includes('veggie') || dish.name.toLowerCase().includes('burrata');
  const isSpicy = dish.tags?.some((t) => /épic|piment|spicy/i.test(t)) || dish.description.toLowerCase().includes('piment');
  const isChefSpecial = dish.tags?.some((t) => /signature|chef|coup de cœur|incontournable/i.test(t));

  // Presumed allergens based on standard categories/descriptions
  const allergens: string[] = [];
  const text = `${dish.name} ${dish.description}`.toLowerCase();
  if (text.includes('pain') || text.includes('farine') || text.includes('bun') || text.includes('tuile') || text.includes('croûte') || text.includes('tarte') || text.includes('biscuit') || text.includes('sarrasin')) {
    allergens.push('Gluten');
  }
  if (text.includes('burrata') || text.includes('crème') || text.includes('lait') || text.includes('fromage') || text.includes('parmesan') || text.includes('mozzarella') || text.includes('beurre') || text.includes('cheddar') || text.includes('mascarpone')) {
    allergens.push('Lactose');
  }
  if (text.includes('pignons') || text.includes('amande') || text.includes('noisette') || text.includes('noix') || text.includes('pistache')) {
    allergens.push('Fruits à coque');
  }
  if (text.includes('saumon') || text.includes('loup') || text.includes('poisson') || text.includes('saint-jacques') || text.includes('crustacé') || text.includes('crevette')) {
    allergens.push('Poissons & Crustacés');
  }
  if (text.includes('œuf') || text.includes('oeuf') || text.includes('mayonnaise') || text.includes('béarnaise')) {
    allergens.push('Œufs');
  }

  const guestOptions = peopleCount > 1
    ? [
        ...Array.from({ length: peopleCount }, (_, i) => `Personne ${i + 1}`),
        'Toute la table',
      ]
    : ['Personne 1'];

  const handleAddToCart = () => {
    playTapSound();
    setIsOrdered(true);

    // Dribelot signature festive confetti burst
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.75 },
        colors: ['#E85D04', '#F48C06', '#FAA307', '#2B2D42', '#D4AF37'],
      });
    } catch {
      // fallback safe
    }

    addItem(dish, quantity, selectedGuest, specialInstructions.trim() || undefined);
    setSelectedGuestForAdd(selectedGuest);

    setTimeout(() => {
      setIsOrdered(false);
      onClose();
    }, 700);
  };

  const totalPrice = formatMoney(dish.price * quantity, dish.currency);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] bg-[#F9F6F0] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E1D5] flex flex-col paper-texture"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Image Banner with Close Button */}
        <div className="relative w-full h-52 sm:h-64 bg-[#1E202B] shrink-0">
          <img
            src={dish.image_url}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#15161E]/80 via-transparent to-black/40" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors shadow-lg active:scale-95"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges Overlay */}
          <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold bg-[#E85D04] text-white px-3 py-1 rounded-full shadow-md">
                {dish.category}
              </span>
              {isChefSpecial && (
                <span className="text-[11px] font-bold bg-[#FAA307] text-[#1A1B29] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  Spécialité du Chef
                </span>
              )}
            </div>

            {dish.preparation_time_minutes && (
              <span className="text-[11px] font-bold bg-black/60 text-white backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                <Clock className="w-3 h-3 text-[#FAA307]" />
                {dish.preparation_time_minutes} min
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Header Title & Price */}
          <div className="flex items-start justify-between gap-4 border-b border-[#E8E1D5] pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#2B2D42] font-serif tracking-tight leading-snug">
                {dish.name}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                {isVegetarian && (
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded-full">
                    <Leaf className="w-3.5 h-3.5" /> Végétarien
                  </span>
                )}
                {isSpicy && (
                  <span className="flex items-center gap-1 text-red-600 font-semibold bg-red-100/60 px-2 py-0.5 rounded-full">
                    <Flame className="w-3.5 h-3.5" /> Épicé
                  </span>
                )}
                {dish.tags?.filter((t) => !/végé|épic/i.test(t)).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium text-[#6B4226] bg-[#EFE9DE] px-2 py-0.5 rounded-full border border-[#E8E1D5]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#E85D04] font-serif block">
                {formatMoney(dish.price, dish.currency)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold">TTC</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs sm:text-sm text-[#4A4E69] leading-relaxed">
              {dish.description}
            </p>
          </div>

          {/* Presumed Allergens */}
          {allergens.length > 0 && (
            <div className="p-3 rounded-xl bg-[#FFFDF9] border border-[#E8E1D5]">
              <div className="flex items-center gap-1.5 text-xs text-[#6B4226] font-semibold mb-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Allergènes présumés :</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allergens.map((all, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-amber-100/80 border border-amber-300 text-amber-900 px-2 py-0.5 rounded-md font-medium"
                  >
                    {all}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Guest Attribution */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8E1D5]">
            <label className="text-xs font-bold uppercase tracking-wider text-[#2B2D42] block mb-2.5">
              Attribuer ce plat à :
            </label>
            <div className="flex flex-wrap gap-2">
              {guestOptions.map((opt) => {
                const isSelected = selectedGuest === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      playTapSound();
                      setSelectedGuest(opt);
                    }}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-full font-bold text-xs transition-all duration-200 border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white border-transparent shadow-md scale-105'
                        : 'bg-[#F9F6F0] text-[#2B2D42] border-[#E8E1D5] hover:border-[#E85D04]/40 hover:bg-white'
                    }`}
                  >
                    <span>{opt === 'Toute la table' ? '🍽️' : '👤'}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="text-xs font-semibold text-[#555870] block mb-1.5">
              Remarques pour la cuisine (optionnel) :
            </label>
            <input
              type="text"
              placeholder="Ex: Cuisson saignante, sauce à part, sans oignons..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#E8E1D5] text-[#2B2D42] text-xs sm:text-sm placeholder-[#8C8275]/60 focus:outline-none focus:border-[#E85D04] focus:ring-1 focus:ring-[#E85D04]/40 transition-all"
            />
          </div>
        </div>

        {/* Sticky Modal Bottom Actions */}
        <div className="p-4 sm:p-5 bg-[#FFFDF9] border-t border-[#E8E1D5] flex items-center justify-between gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-[#D5CEC2] rounded-xl bg-white overflow-hidden shadow-sm shrink-0">
            <button
              onClick={() => {
                if (quantity > 1) {
                  playTapSound();
                  setQuantity((q) => q - 1);
                }
              }}
              disabled={quantity <= 1}
              className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-bold transition-colors ${
                quantity <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-[#2B2D42] hover:bg-orange-50 active:scale-95'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center text-sm sm:text-base font-bold text-[#2B2D42]">
              {quantity}
            </span>
            <button
              onClick={() => {
                playTapSound();
                setQuantity((q) => q + 1);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-[#2B2D42] hover:bg-orange-50 active:scale-95 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Submit / Order button in Dribelot vibrant orange */}
          <button
            onClick={handleAddToCart}
            disabled={!dish.is_available || isOrdered}
            className={`flex-1 min-h-[46px] sm:min-h-[50px] py-2.5 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 active:scale-[0.98] ${
              dish.is_available
                ? isOrdered
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-[#E85D04] via-[#F48C06] to-[#E85D04] hover:brightness-105 text-white shadow-orange-500/30'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isOrdered ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Ajouté avec succès !</span>
              </>
            ) : dish.is_available ? (
              <>
                <span>Ajouter ({selectedGuest})</span>
                <span>&bull;</span>
                <span className="font-extrabold">{totalPrice}</span>
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
