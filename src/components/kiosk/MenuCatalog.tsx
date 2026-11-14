'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MenuItem, MenuCategory } from '@/types';
import { DataService } from '@/lib/data-service';
import { useTabletStore } from '@/store/tabletStore';
import { useCartStore } from '@/store/cartStore';
import { DishDetailModal } from './DishDetailModal';
import {
  Search,
  Bell,
  Users,
  Plus,
  Check,
  RotateCcw
} from 'lucide-react';
import { playTapSound } from '@/lib/sound';

const CATEGORIES: ('Toutes' | MenuCategory)[] = [
  'Toutes',
  'Entrées',
  'Plats',
  'Spécialités',
  'Desserts',
  'Boissons',
  'Vins',
];

// Authentic Chalkboard Brush Banner matching Image 1
const CategoryBrushBanner: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="relative inline-flex items-center justify-center my-2 select-none">
      <svg
        viewBox="0 0 240 38"
        className="w-44 sm:w-52 h-8 sm:h-9 filter drop-shadow-[0_2px_6px_rgba(217,119,6,0.3)]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`brushGrad-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="15%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="85%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Organic brush stroke with bristle fringe */}
        <path
          d="M 12 10 
             C 4 12, 1 15, 0 19 
             C 2 23, 6 26, 12 28 
             C 22 30, 45 31, 80 32 
             C 130 33, 175 32, 205 30 
             C 224 29, 235 25, 240 20 
             C 238 15, 230 11, 218 9 
             C 185 6, 130 5, 80 6 
             C 45 7, 24 8, 12 10 Z"
          fill={`url(#brushGrad-${title})`}
        />
        {/* Subtle bristle highlights */}
        <path
          d="M 8 16 L 2 19 L 7 22 M 232 15 L 238 19 L 233 23 M 20 10 C 70 7, 160 6, 215 9"
          stroke="#FEF08A"
          strokeWidth="1.2"
          fill="none"
          opacity="0.4"
        />
      </svg>
      {/* Centered White Bold Condensed Text */}
      <span className="absolute inset-0 flex items-center justify-center font-black tracking-widest text-[11px] sm:text-xs text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {title}
      </span>
    </div>
  );
};

// Subtle Chalkboard Botanical & Culinary Watermarks (matching Image 1)
const ChalkWatermarks: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
    {/* Top-Left Botanical Herb / Rosemary sprig */}
    <svg className="absolute -top-6 -left-6 w-52 h-52 text-white/[0.045] fill-none stroke-current stroke-1" viewBox="0 0 100 100">
      <path d="M10 85 Q 35 50, 75 15" />
      <path d="M 25 65 Q 35 50, 20 42 Q 30 58, 25 65" fill="currentColor" fillOpacity="0.03" />
      <path d="M 40 50 Q 58 38, 48 26 Q 46 45, 40 50" fill="currentColor" fillOpacity="0.03" />
      <path d="M 58 34 Q 74 24, 68 14 Q 62 30, 58 34" fill="currentColor" fillOpacity="0.03" />
      <circle cx="28" cy="45" r="2.5" />
      <circle cx="52" cy="30" r="2" />
    </svg>

    {/* Top-Right Chili / Culinary spice doodle */}
    <svg className="absolute -top-4 -right-4 w-48 h-48 text-white/[0.04] fill-none stroke-current stroke-1" viewBox="0 0 100 100">
      <path d="M85 15 C65 25, 42 55, 58 82 C68 66, 78 40, 85 15 Z" fill="currentColor" fillOpacity="0.02" />
      <path d="M85 15 Q 92 10, 96 14" />
      <path d="M28 20 Q 38 30, 28 40 Q 18 30, 28 20 Z" fill="currentColor" fillOpacity="0.02" />
    </svg>

    {/* Bottom-Left Cooking Utensil / Fork & Knife */}
    <svg className="absolute -bottom-8 -left-6 w-56 h-56 text-white/[0.04] fill-none stroke-current stroke-1" viewBox="0 0 100 100">
      <path d="M20 95 L 48 40" />
      <path d="M 42 42 L 52 28 L 47 50" />
      <path d="M 35 95 L 62 40" />
      <path d="M 58 42 Q 70 25, 64 48" />
      <circle cx="48" cy="30" r="3" />
    </svg>

    {/* Subtle Chalk Dust Grain Pattern */}
    <div
      className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }}
    />
  </div>
);

export const MenuCatalog: React.FC = () => {
  const { config, peopleCount, callWaiter, selectedGuestForAdd } = useTabletStore();
  const { addItem } = useCartStore();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'Toutes' | MenuCategory>('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  useEffect(() => {
    DataService.getMenuItems().then(setMenuItems);

    const unsubscribe = DataService.subscribe((event) => {
      if (event.type === 'MENU_UPDATED') {
        DataService.getMenuItems().then(setMenuItems);
      }
    });

    return unsubscribe;
  }, []);

  const handleOpenDish = (dish: MenuItem) => {
    playTapSound();
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  const handleCallStaff = async () => {
    playTapSound();
    setWaiterCalled(true);
    await callWaiter();
    setTimeout(() => setWaiterCalled(false), 4000);
  };

  const handleQuickAdd = (e: React.MouseEvent, dish: MenuItem) => {
    e.stopPropagation();
    playTapSound();
    addItem(dish, 1, selectedGuestForAdd || 'Personne 1');
    setQuickAddedId(dish.id);
    setTimeout(() => setQuickAddedId(null), 800);
  };

  // Filter items by category & search (no dietary filters)
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'Toutes' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Identify chef special dish for showcase in bottom right (similar to "THE FOOD RESTO" in Image 1)
  const chefSpecial =
    menuItems.find(item => item.tags?.includes('Signature') && item.is_available) ||
    menuItems.find(item => item.category === 'Plats') ||
    menuItems[0];

  // Helper to render an item row in the chalkboard list
  const renderDishRow = (dish: MenuItem) => {
    const isQuickAdded = quickAddedId === dish.id;

    return (
      <div
        key={dish.id}
        onClick={() => handleOpenDish(dish)}
        className="group relative flex flex-col py-2 px-2.5 sm:px-3 rounded-xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-all duration-150 cursor-pointer select-none border border-transparent hover:border-white/5"
      >
        {/* Top line: Name + Dotted Leader + Price + Quick Add */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-white tracking-wide uppercase group-hover:text-amber-300 transition-colors">
              {dish.name}
            </h4>
            {dish.tags?.includes('Signature') && (
              <span className="shrink-0 text-amber-400 text-xs" title="Signature du Chef">
                ★
              </span>
            )}
            {!dish.is_available && (
              <span className="shrink-0 px-1.5 py-0.5 rounded bg-rose-600/30 text-rose-300 text-[9px] font-bold uppercase tracking-wider">
                Épuisé
              </span>
            )}
          </div>

          {/* Dotted leader between name and price */}
          <div className="flex-1 border-b border-dotted border-white/20 mx-2 hidden sm:block self-center min-w-[20px]" />

          <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
            <span className="font-bold text-xs sm:text-sm text-white font-mono group-hover:text-amber-300 transition-colors">
              {dish.price.toFixed(2)} €
            </span>
            <button
              type="button"
              disabled={!dish.is_available}
              onClick={(e) => handleQuickAdd(e, dish)}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                isQuickAdded
                  ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/30'
                  : 'bg-white/10 hover:bg-amber-400 hover:text-black text-slate-200 active:scale-90 border border-white/10'
              }`}
              title="Ajouter au panier"
            >
              {isQuickAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Bottom line: Description */}
        <p className="text-[11px] sm:text-xs text-slate-400 font-light leading-snug mt-0.5 pr-6 line-clamp-2">
          {dish.description}
        </p>
      </div>
    );
  };

  // Helper to render a category section
  const renderCategorySection = (categoryTitle: string, items: MenuItem[]) => {
    if (items.length === 0) return null;

    return (
      <div key={categoryTitle} className="mb-4 sm:mb-6">
        <div className="flex justify-center sm:justify-start mb-1.5">
          <CategoryBrushBanner title={categoryTitle} />
        </div>
        <div className="space-y-0.5 sm:space-y-1">
          {items.map(renderDishRow)}
        </div>
      </div>
    );
  };

  // Group items by category for layout
  const itemsByCategory = (cat: MenuCategory) => filteredItems.filter(item => item.category === cat);

  return (
    <div className="relative w-full h-full flex flex-col select-none overflow-hidden pb-24 text-slate-100">
      {/* 1. ATMOSPHERIC RESTAURANT BACKGROUND (BEHIND EVERYTHING) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.32] contrast-[1.12] scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        {/* Layered dark gradients for readability & luxury ambiance */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#0B0E14]/85 to-[#0B0E14]/92" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0B0E14]/50 to-[#0B0E14]/95" />
        {/* Warm golden light bloom */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Tablet Header Bar */}
      <header className="glass-panel sticky top-0 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3 z-30 border-b border-[#D4AF37]/20 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
          <div className="relative h-9 sm:h-11 w-32 sm:w-40 shrink-0">
            <Image
              src="/logo.png"
              alt="Mat House Restaurant"
              fill
              className="object-contain object-left filter drop-shadow-[0_2px_12px_rgba(212,175,55,0.5)]"
              priority
            />
          </div>

          <div className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E5C158] font-extrabold text-xs tracking-wider shrink-0 shadow-gold-subtle">
            TABLE {config.tableNumber}
          </div>

          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{peopleCount} {peopleCount === 1 ? 'convive' : 'convives'}</span>
          </div>

          {selectedGuestForAdd && (
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <span>Ajout pour : {selectedGuestForAdd}</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs sm:max-w-md mx-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
          <input
            type="text"
            placeholder="Rechercher un mets, ingrédient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-xs sm:text-sm rounded-full bg-[#121824]/90 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300 shadow-inner"
          />
        </div>

        {/* Waiter Call Button */}
        <button
          onClick={handleCallStaff}
          className={`px-3.5 sm:px-4 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 flex items-center gap-2 shrink-0 ${
            waiterCalled
              ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 animate-pulse shadow-emerald-500/20'
              : 'bg-[#121824]/80 text-slate-200 border-white/10 hover:border-[#D4AF37]/40 active:scale-95'
          }`}
          title="Appeler un serveur à votre table"
        >
          <Bell className={`w-4 h-4 ${waiterCalled ? 'text-emerald-400 rotate-12' : 'text-[#D4AF37]'}`} />
          <span className="hidden md:inline">{waiterCalled ? 'Serveur prévenu' : 'Serveur'}</span>
        </button>
      </header>

      {/* Slim Category Navigation Pills */}
      <div className="px-4 sm:px-8 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-[#0e131d]/75 backdrop-blur-md z-20">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                playTapSound();
                setSelectedCategory(cat);
              }}
              className={`min-h-[34px] px-3.5 sm:px-5 py-1 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 border ${
                isSelected
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0B0E14] border-[#F5E6B3]/60 shadow-gold-subtle font-extrabold'
                  : 'bg-[#121824]/90 text-slate-300 border-white/[0.08] hover:border-[#D4AF37]/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          );
        })}

        {(searchQuery || selectedCategory !== 'Toutes') && (
          <button
            onClick={() => {
              playTapSound();
              setSearchQuery('');
              setSelectedCategory('Toutes');
            }}
            className="flex items-center gap-1 text-xs text-[#D4AF37] hover:underline ml-auto font-bold whitespace-nowrap shrink-0 pl-2"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Voir tout le menu</span>
          </button>
        )}
      </div>

      {/* Main Chalkboard Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-36 sm:pb-40">
        <div className="max-w-7xl mx-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-[#121824]/80 backdrop-blur-md rounded-3xl border border-white/5 max-w-lg mx-auto">
              <p className="text-base text-slate-400 mb-3">Aucun mets ne correspond à vos critères.</p>
              <button
                onClick={() => {
                  setSelectedCategory('Toutes');
                  setSearchQuery('');
                }}
                className="text-[#D4AF37] underline text-sm font-bold hover:text-[#E5C158]"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : selectedCategory !== 'Toutes' ? (
            /* Single Category Focused View */
            <div className="relative bg-[#0F131A]/95 backdrop-blur-xl rounded-3xl border border-[#D4AF37]/25 p-5 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
              <ChalkWatermarks />
              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <CategoryBrushBanner title={selectedCategory} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {filteredItems.map(renderDishRow)}
                </div>
              </div>
            </div>
          ) : (
            /* Full Chalkboard Menu Board Layout (Matching Image 1) */
            <div className="relative bg-[#0F131A]/95 backdrop-blur-xl rounded-3xl border border-[#D4AF37]/30 p-5 sm:p-8 lg:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden">
              {/* Subtle Chalkboard Watermarks and Grain */}
              <ChalkWatermarks />

              <div className="relative z-10">
                {/* Harmonious Slate Header across both columns */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-4 mb-6 sm:mb-8 gap-2">
                  <div>
                    <span className="text-xs font-black tracking-[0.25em] text-amber-400 uppercase block mb-0.5">
                      MAT HOUSE RESTAURANT
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-sans">
                      LE MENU
                    </h1>
                  </div>
                  <p className="text-xs text-slate-400 font-light max-w-xs sm:text-right">
                    Mets d'exception préparés minute par notre brigade gastronomique
                  </p>
                </div>

                {/* Perfectly Aligned 2-Column Board */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
                  {/* --- COLUMN 1 (LEFT) --- */}
                  <div className="flex flex-col">
                    {/* Section: Entrées (APPETIZER) */}
                    {renderCategorySection('Entrées', itemsByCategory('Entrées'))}

                    {itemsByCategory('Entrées').length > 0 && itemsByCategory('Desserts').length > 0 && (
                      <div className="w-full h-px bg-white/15 my-3 sm:my-4" />
                    )}

                    {/* Section: Desserts (DESSERTS) */}
                    {renderCategorySection('Desserts', itemsByCategory('Desserts'))}

                    {itemsByCategory('Desserts').length > 0 && itemsByCategory('Boissons').length > 0 && (
                      <div className="w-full h-px bg-white/15 my-3 sm:my-4" />
                    )}

                    {/* Section: Boissons (DRINKS) */}
                    {renderCategorySection('Boissons', itemsByCategory('Boissons'))}
                  </div>

                  {/* --- COLUMN 2 (RIGHT) --- */}
                  <div className="flex flex-col">
                    {/* Section: Spécialités (SPECIAL MENU) */}
                    {renderCategorySection('Spécialités', itemsByCategory('Spécialités'))}

                    {itemsByCategory('Spécialités').length > 0 && itemsByCategory('Plats').length > 0 && (
                      <div className="w-full h-px bg-white/15 my-3 sm:my-4" />
                    )}

                    {/* Section: Plats (MAIN DISHES) */}
                    {renderCategorySection('Plats', itemsByCategory('Plats'))}

                    {itemsByCategory('Plats').length > 0 && itemsByCategory('Vins').length > 0 && (
                      <div className="w-full h-px bg-white/15 my-3 sm:my-4" />
                    )}

                    {/* Section: Vins */}
                    {renderCategorySection('Vins', itemsByCategory('Vins'))}

                    {/* Bottom Right Culinary Plate Showcase (THE FOOD RESTO in Image 1) */}
                    {chefSpecial && (
                      <div className="mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                        <div className="text-center sm:text-left flex-1">
                          <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase block">
                            THE FOOD RESTO
                          </span>
                          <h3 className="text-sm sm:text-base font-serif font-bold text-white uppercase tracking-wider mt-0.5">
                            SÉLECTION DU CHEF
                          </h3>
                          <p className="text-[11px] text-slate-400 font-light max-w-xs mt-1">
                            Création d'exception préparée minute avec des produits nobles du terroir.
                          </p>
                          <button
                            onClick={() => handleOpenDish(chefSpecial)}
                            className="mt-3 px-4 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 mx-auto sm:mx-0 active:scale-95"
                          >
                            <span>Découvrir la création</span>
                            <span>&bull; {chefSpecial.price.toFixed(2)} €</span>
                          </button>
                        </div>

                        <div
                          onClick={() => handleOpenDish(chefSpecial)}
                          className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-full overflow-hidden border-2 border-amber-400/40 shadow-xl cursor-pointer group"
                        >
                          <Image
                            src={chefSpecial.image_url}
                            alt={chefSpecial.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dish Detail & Customization Modal */}
      <DishDetailModal
        dish={selectedDish}
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
      />
    </div>
  );
};
