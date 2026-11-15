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
  RotateCcw,
  Flame,
  Leaf,
  Sparkles,
  ChevronRight,
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

// Category metadata for Dribelot-style editorial presentation
const CATEGORY_META: Record<
  string,
  {
    subtitle: string;
    scriptTag: string;
    headerImage: string;
    footerImage: string;
  }
> = {
  Toutes: {
    subtitle: 'Carte Gastronomique & Créations Gourmandes',
    scriptTag: 'Cuisine d’Émotion & Terroir',
    headerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    footerImage: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=400&q=80',
  },
  Entrées: {
    subtitle: 'Pour Débuter la Dégustation',
    scriptTag: 'Fraîcheur & Finesse',
    headerImage: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80',
    footerImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
  },
  Plats: {
    subtitle: 'Pièces Nobles & Cuissons Maîtrisées',
    scriptTag: 'Viandes & Poissons d’Exception',
    headerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    footerImage: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
  },
  Spécialités: {
    subtitle: 'La Signature Unique de Notre Chef',
    scriptTag: 'Incontournables de la Maison',
    headerImage: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    footerImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
  },
  Desserts: {
    subtitle: 'Douceurs Sucrées & Pâtisseries Fines',
    scriptTag: 'Gourmandise & Délicatesse',
    headerImage: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    footerImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
  },
  Boissons: {
    subtitle: 'Mocktails, Nectars & Rafraîchissements',
    scriptTag: 'Élixirs & Infusions Fraîches',
    headerImage: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80',
    footerImage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80',
  },
  Vins: {
    subtitle: 'Sélection de Grands Crus & Domaines',
    scriptTag: 'Cave du Sommelier',
    headerImage: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    footerImage: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=400&q=80',
  },
};

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
    setTimeout(() => setQuickAddedId(null), 900);
  };

  // Filter items by category & search
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'Toutes' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group helpers
  const itemsByCategory = (cat: MenuCategory) => filteredItems.filter((item) => item.category === cat);

  const chefSpecial =
    menuItems.find((item) => item.tags?.includes('Signature') && item.is_available) ||
    menuItems.find((item) => item.category === 'Plats') ||
    menuItems[0];

  // Helper to determine dietary tags
  const getDietaryFlags = (dish: MenuItem) => {
    const isVegetarian =
      dish.tags?.some((t) => /végé/i.test(t)) ||
      dish.name.toLowerCase().includes('veggie') ||
      dish.name.toLowerCase().includes('burrata');
    const isSpicy =
      dish.tags?.some((t) => /épic|piment|spicy/i.test(t)) ||
      dish.description.toLowerCase().includes('piment');
    const isChefSpecial = dish.tags?.some((t) =>
      /signature|chef|coup de cœur|incontournable/i.test(t)
    );
    return { isVegetarian, isSpicy, isChefSpecial };
  };

  // Render an individual dish item row in authentic Dribelot style
  const renderDribelotDishRow = (dish: MenuItem) => {
    const isQuickAdded = quickAddedId === dish.id;
    const { isVegetarian, isSpicy, isChefSpecial } = getDietaryFlags(dish);

    return (
      <div
        key={dish.id}
        onClick={() => handleOpenDish(dish)}
        className="group relative cursor-pointer p-2 sm:p-2.5 rounded-xl hover:bg-orange-500/[0.06] active:bg-orange-500/[0.1] transition-all duration-200 flex flex-col justify-between border border-transparent hover:border-[#E85D04]/20"
      >
        <div>
          {/* Title + Badges + Dotted Leader + Price + Quick Add */}
          <div className="flex items-baseline justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <h4 className="text-xs sm:text-[13.5px] font-bold text-[#2B2D42] truncate group-hover:text-[#E85D04] transition-colors font-sans">
                {dish.name}
              </h4>
              {isVegetarian && (
                <span title="Végétarien">
                  <Leaf className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0" />
                </span>
              )}
              {isSpicy && (
                <span title="Épicé">
                  <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 flex-shrink-0" />
                </span>
              )}
              {isChefSpecial && (
                <span title="Coup de cœur Chef">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 flex-shrink-0" />
                </span>
              )}
              {!dish.is_available && (
                <span className="shrink-0 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold uppercase tracking-wider">
                  Épuisé
                </span>
              )}
            </div>

            {/* Dotted Leader Line */}
            <div className="flex-1 border-b border-dotted border-[#D5CEC2] mx-1 sm:mx-2 hidden sm:block self-center min-w-[14px]" />

            {/* Price and Quick Add */}
            <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
              <span className="text-xs sm:text-[14px] font-extrabold text-[#E85D04] font-serif shrink-0">
                {dish.price.toFixed(2)} €
              </span>
              <button
                type="button"
                disabled={!dish.is_available}
                onClick={(e) => handleQuickAdd(e, dish)}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                  isQuickAdded
                    ? 'bg-emerald-600 text-white scale-110 shadow-emerald-600/30'
                    : 'bg-[#FFFDF9] text-[#E85D04] hover:bg-[#E85D04] hover:text-white border border-[#E8E1D5] active:scale-90 shadow-sm'
                }`}
                title="Ajouter au panier"
              >
                {isQuickAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-[11px] sm:text-[12px] text-[#555870] leading-snug mt-1 pr-6 line-clamp-2">
            {dish.description}
          </p>
        </div>

        {/* Tap to view hint on hover */}
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-[#E85D04] font-medium">
          <ChevronRight className="w-3 h-3" />
          <span>Voir détails, ingrédients & options</span>
        </div>
      </div>
    );
  };

  // Section Header inside the parchment paper
  const renderCategoryHeader = (categoryName: string, isCoverSpread = false) => {
    const meta = CATEGORY_META[categoryName] || CATEGORY_META['Toutes'];

    return (
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#E8E1D5] mb-4 select-none">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#E85D04]/40 shadow-md ring-4 ring-[#E85D04]/10 shrink-0">
            <img
              src={meta.headerImage}
              alt={categoryName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#E85D04] font-extrabold block">
              {isCoverSpread ? 'Le Menu Gastronomique' : 'Catégorie'}
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2B2D42] font-serif leading-tight">
              {categoryName === 'Toutes' ? 'Notre Carte' : categoryName}
            </h2>
            <p className="text-xs sm:text-sm text-[#E85D04] font-script -mt-0.5">
              {meta.scriptTag}
            </p>
          </div>
        </div>

        <div className="text-right hidden xs:block">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#E85D04] font-serif block">
            MAT HOUSE
          </span>
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#6B4226]/80 font-bold -mt-0.5">
            Cuisine Fait Maison
          </p>
        </div>
      </div>
    );
  };

  // Bottom Footer inside the parchment paper
  const renderPageFooter = (pageStr: string, imageSrc?: string) => {
    return (
      <div className="relative z-10 pt-3 border-t border-[#E8E1D5] flex items-center justify-between mt-4 select-none">
        <div className="flex items-center gap-2">
          {imageSrc && (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#E85D04]/30 shadow-sm shrink-0">
              <img src={imageSrc} alt="Terroir" className="w-full h-full object-cover" />
            </div>
          )}
          <span className="text-[11px] text-[#6B4226]/85 font-serif italic">
            Ingrédients Frais & Produits du Terroir
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-[#8C8275]">
            {pageStr} &bull; MAT HOUSE
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col select-none overflow-hidden pb-24 text-slate-100">
      {/* 1. ATMOSPHERIC LUXURY RESTAURANT BACKGROUND (BEHIND THE PAPER MENU) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.22] contrast-[1.15] scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C11] via-[#121318]/90 to-[#121318]/95" />
        {/* Warm amber light bloom resembling restaurant lamp over the table */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-amber-500/[0.05] rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Tablet Header Bar */}
      <header className="glass-panel sticky top-0 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3 z-30 border-b border-[#E85D04]/25 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
          <div className="relative h-9 sm:h-11 w-32 sm:w-40 shrink-0">
            <Image
              src="/logo.png"
              alt="Mat House Restaurant"
              fill
              className="object-contain object-left filter drop-shadow-[0_2px_12px_rgba(232,93,4,0.4)]"
              priority
            />
          </div>

          <div className="px-3 py-1 rounded-full bg-[#E85D04]/15 border border-[#E85D04]/40 text-[#FAA307] font-extrabold text-xs tracking-wider shrink-0 shadow-sm">
            TABLE {config.tableNumber}
          </div>

          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-[#FAA307]" />
            <span>{peopleCount} {peopleCount === 1 ? 'convive' : 'convives'}</span>
          </div>

          {selectedGuestForAdd && (
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-bold">
              <span>Ajout pour : {selectedGuestForAdd}</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs sm:max-w-md mx-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAA307]" />
          <input
            type="text"
            placeholder="Rechercher un mets, ingrédient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-xs sm:text-sm rounded-full bg-[#121824]/90 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-[#E85D04] focus:ring-1 focus:ring-[#E85D04]/50 transition-all duration-300 shadow-inner"
          />
        </div>

        {/* Waiter Call Button */}
        <button
          onClick={handleCallStaff}
          className={`px-3.5 sm:px-4 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 flex items-center gap-2 shrink-0 ${
            waiterCalled
              ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 animate-pulse shadow-emerald-500/20'
              : 'bg-[#121824]/80 text-slate-200 border-white/10 hover:border-[#E85D04]/40 active:scale-95'
          }`}
          title="Appeler un serveur à votre table"
        >
          <Bell className={`w-4 h-4 ${waiterCalled ? 'text-emerald-400 rotate-12' : 'text-[#FAA307]'}`} />
          <span className="hidden md:inline">{waiterCalled ? 'Serveur prévenu' : 'Serveur'}</span>
        </button>
      </header>

      {/* Dribelot-Style Category Navigation Pills */}
      <div className="px-4 sm:px-8 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-[#0e131d]/85 backdrop-blur-md z-20">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                playTapSound();
                setSelectedCategory(cat);
              }}
              className={`min-h-[36px] px-4 sm:px-5 py-1 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 border ${
                isSelected
                  ? 'bg-gradient-to-r from-[#E85D04] via-[#F48C06] to-[#E85D04] text-white border-transparent shadow-[0_4px_16px_rgba(232,93,4,0.4)] scale-105'
                  : 'bg-[#1A1D27]/90 text-[#E8E1D5] border-white/10 hover:border-[#E85D04]/40 hover:text-white'
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
            className="flex items-center gap-1 text-xs text-[#FAA307] hover:underline ml-auto font-bold whitespace-nowrap shrink-0 pl-2"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Voir tout le menu</span>
          </button>
        )}
      </div>

      {/* MAIN DRIBELOT WARM PAPER SPREAD SCROLL AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-36 sm:pb-40">
        <div className="max-w-6xl mx-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-[#F9F6F0] paper-texture rounded-3xl border border-[#E8E1D5] max-w-lg mx-auto shadow-xl">
              <p className="text-base font-serif font-bold text-[#2B2D42] mb-3">
                Aucun met ne correspond à votre recherche.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('Toutes');
                  setSearchQuery('');
                }}
                className="text-[#E85D04] underline text-sm font-bold hover:text-[#DC2F02]"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : selectedCategory !== 'Toutes' ? (
            /* ============================================================ */
            /* SINGLE CATEGORY EDITORIAL SPREAD (DRIBELOT STYLE)            */
            /* ============================================================ */
            <div className="relative bg-[#F9F6F0] paper-texture rounded-3xl border border-[#E8E1D5] p-5 sm:p-8 paper-card-shadow overflow-hidden">
              {/* Warm decorative gradient flares */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {renderCategoryHeader(selectedCategory)}

                {/* 2-Columns Dishes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-3 sm:gap-y-4 my-2">
                  {filteredItems.map(renderDribelotDishRow)}
                </div>

                {renderPageFooter(
                  selectedCategory,
                  CATEGORY_META[selectedCategory]?.footerImage || CATEGORY_META['Toutes'].footerImage
                )}
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* FULL 2-PAGE MAGAZINE SPREAD (DRIBELOT DUAL-PAGE BOOK STYLE) */
            /* ============================================================ */
            <div className="relative bg-[#F9F6F0] paper-texture rounded-3xl border border-[#E8E1D5] paper-card-shadow overflow-hidden">
              {/* Decorative warm ambient tints */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Editorial Header across full spread */}
              <div className="p-5 sm:p-8 pb-4 border-b border-[#E8E1D5]">
                {renderCategoryHeader('Toutes', true)}
              </div>

              {/* Open Magazine Spread: Left Page & Right Page with 3D Center Spine */}
              <div className="grid grid-cols-1 lg:grid-cols-2 relative">
                {/* --- PAGE GAUCHE (LEFT SPREAD) --- */}
                <div className="p-5 sm:p-8 lg:pr-10 relative flex flex-col justify-between spine-shadow-left">
                  <div className="space-y-6">
                    {/* ENTRÉES SECTION */}
                    {itemsByCategory('Entrées').length > 0 && (
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]/80 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold font-serif text-[#2B2D42] flex items-center gap-2">
                            <span>Entrées</span>
                            <span className="text-xs font-script text-[#E85D04] font-normal">
                              Pour débuter
                            </span>
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold">
                            Appetizers
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                          {itemsByCategory('Entrées').map(renderDribelotDishRow)}
                        </div>
                      </div>
                    )}

                    {/* DESSERTS SECTION */}
                    {itemsByCategory('Desserts').length > 0 && (
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]/80 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold font-serif text-[#2B2D42] flex items-center gap-2">
                            <span>Desserts</span>
                            <span className="text-xs font-script text-[#E85D04] font-normal">
                              Douceurs sucrées
                            </span>
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold">
                            Artisanal Sweets
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                          {itemsByCategory('Desserts').map(renderDribelotDishRow)}
                        </div>
                      </div>
                    )}

                    {/* BOISSONS SECTION */}
                    {itemsByCategory('Boissons').length > 0 && (
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]/80 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold font-serif text-[#2B2D42] flex items-center gap-2">
                            <span>Boissons & Mocktails</span>
                            <span className="text-xs font-script text-[#E85D04] font-normal">
                              Fraîcheur
                            </span>
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold">
                            Drinks
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                          {itemsByCategory('Boissons').map(renderDribelotDishRow)}
                        </div>
                      </div>
                    )}
                  </div>

                  {renderPageFooter('Page 1', CATEGORY_META['Entrées'].footerImage)}
                </div>

                {/* 3D Center Spine Groove Divider for Large Screens */}
                <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-10 bg-gradient-to-r from-black/[0.08] via-black/[0.18] to-black/[0.08]" />

                {/* --- PAGE DROITE (RIGHT SPREAD) --- */}
                <div className="p-5 sm:p-8 lg:pl-10 relative flex flex-col justify-between spine-shadow-right border-t lg:border-t-0 border-[#E8E1D5]">
                  <div className="space-y-6">
                    {/* SPÉCIALITÉS SECTION */}
                    {itemsByCategory('Spécialités').length > 0 && (
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]/80 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold font-serif text-[#2B2D42] flex items-center gap-2">
                            <span>Spécialités du Chef</span>
                            <span className="text-xs font-script text-[#E85D04] font-normal">
                              Créations
                            </span>
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider text-[#E85D04] font-bold bg-orange-100 px-2 py-0.5 rounded-full">
                            Chef Specials
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                          {itemsByCategory('Spécialités').map(renderDribelotDishRow)}
                        </div>
                      </div>
                    )}

                    {/* PLATS SECTION */}
                    {itemsByCategory('Plats').length > 0 && (
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]/80 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold font-serif text-[#2B2D42] flex items-center gap-2">
                            <span>Plats Principaux</span>
                            <span className="text-xs font-script text-[#E85D04] font-normal">
                              Viandes & Poissons
                            </span>
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold">
                            Main Courses
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                          {itemsByCategory('Plats').map(renderDribelotDishRow)}
                        </div>
                      </div>
                    )}

                    {/* VINS SECTION */}
                    {itemsByCategory('Vins').length > 0 && (
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]/80 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold font-serif text-[#2B2D42] flex items-center gap-2">
                            <span>Vins & Grands Crus</span>
                            <span className="text-xs font-script text-[#E85D04] font-normal">
                              Cave
                            </span>
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold">
                            Wine Cellar
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                          {itemsByCategory('Vins').map(renderDribelotDishRow)}
                        </div>
                      </div>
                    )}

                    {/* Bottom Right Highlight: Chef Creation Showcase */}
                    {chefSpecial && (
                      <div className="mt-4 p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8E1D5] shadow-sm flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <span className="text-[10px] font-black tracking-widest text-[#E85D04] uppercase block">
                            Coup de Cœur de la Maison
                          </span>
                          <h4 className="text-sm sm:text-base font-serif font-bold text-[#2B2D42] mt-0.5">
                            {chefSpecial.name}
                          </h4>
                          <p className="text-[11px] text-[#555870] line-clamp-1 mt-0.5">
                            {chefSpecial.description}
                          </p>
                          <button
                            onClick={() => handleOpenDish(chefSpecial)}
                            className="mt-2.5 px-3.5 py-1 rounded-full bg-[#E85D04] text-white hover:bg-[#DC2F02] text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <span>Découvrir</span>
                            <span>&bull; {chefSpecial.price.toFixed(2)} €</span>
                          </button>
                        </div>

                        <div
                          onClick={() => handleOpenDish(chefSpecial)}
                          className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full overflow-hidden border-2 border-[#E85D04]/40 shadow-md cursor-pointer group"
                        >
                          <img
                            src={chefSpecial.image_url}
                            alt={chefSpecial.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {renderPageFooter('Page 2', CATEGORY_META['Plats'].footerImage)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dish Detail & Customization Modal (Dribelot Parchment Style) */}
      <DishDetailModal
        dish={selectedDish}
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
      />
    </div>
  );
};
