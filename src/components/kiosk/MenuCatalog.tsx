'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { MenuItem, MenuCategory } from '@/types';
import { DataService } from '@/lib/data-service';
import { useTabletStore } from '@/store/tabletStore';
import { useCartStore } from '@/store/cartStore';
import { DishDetailModal } from './DishDetailModal';
import { FlipBook, FlipBookPage } from './FlipBook';
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
  Hand,
} from 'lucide-react';
import { playTapSound } from '@/lib/sound';
import { placeLabel } from '@/lib/places';
import { CATEGORY_META, MENU_CATEGORIES } from '@/lib/menu-config';
import { formatMoney } from '@/lib/money';

const BOOK_CATEGORIES: MenuCategory[] = MENU_CATEGORIES;
const CATEGORIES: ('Toutes' | MenuCategory)[] = ['Toutes', ...BOOK_CATEGORIES];

/** Dishes per page (pages have a fixed design size, so this guarantees everything fits). */
const ITEMS_PER_PAGE = 5;

type BookPageModel =
  | { kind: 'cover' }
  | { kind: 'toc' }
  | { kind: 'category'; category: MenuCategory; items: MenuItem[]; part: number; parts: number }
  | { kind: 'empty' }
  | { kind: 'notes' }
  | { kind: 'back' };

export const MenuCatalog: React.FC = () => {
  const { config, guestMode, peopleCount, callWaiter, selectedGuestForAdd } = useTabletStore();
  const { addItem, getTotalItems } = useCartStore();
  const cartHasItems = getTotalItems() > 0;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);
  const [pageRequest, setPageRequest] = useState<{ page: number; nonce: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

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

  const turnToPage = (page: number) => {
    setPageRequest({ page, nonce: Date.now() });
  };

  // Filter items by search
  const filteredItems = useMemo(
    () =>
      menuItems.filter((item) => {
        const q = searchQuery.trim().toLowerCase();
        return !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }),
    [menuItems, searchQuery]
  );

  const chefSpecial =
    menuItems.find((item) => item.tags?.includes('Signature') && item.is_available) ||
    menuItems.find((item) => item.category === 'Volailles') ||
    menuItems[0];

  // ---------- Paginate the menu into book pages ----------
  const { pageModels, firstPageOfCategory } = useMemo(() => {
    const models: BookPageModel[] = [{ kind: 'cover' }, { kind: 'toc' }];
    const firstPage: Partial<Record<MenuCategory, number>> = {};

    for (const category of BOOK_CATEGORIES) {
      const items = filteredItems.filter((item) => item.category === category);
      if (items.length === 0) continue;
      const parts = Math.ceil(items.length / ITEMS_PER_PAGE);
      firstPage[category] = models.length;
      for (let part = 0; part < parts; part++) {
        models.push({
          kind: 'category',
          category,
          items: items.slice(part * ITEMS_PER_PAGE, (part + 1) * ITEMS_PER_PAGE),
          part,
          parts,
        });
      }
    }

    if (filteredItems.length === 0 && menuItems.length > 0) models.push({ kind: 'empty' });
    // Keep the back cover on a right-hand page so the last spread has no empty half
    if (models.length % 2 === 0) models.push({ kind: 'notes' });
    models.push({ kind: 'back' });

    return { pageModels: models, firstPageOfCategory: firstPage };
  }, [filteredItems, menuItems.length]);

  // When searching, jump straight to the first matching page
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const t = setTimeout(() => turnToPage(2), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Which category pill is active for the page currently open
  const activeCategory: 'Toutes' | MenuCategory = (() => {
    const model = pageModels[currentPage];
    const neighbour = pageModels[currentPage + 1];
    if (model?.kind === 'category') return model.category;
    if (neighbour?.kind === 'category') return neighbour.category;
    return 'Toutes';
  })();

  // Helper to determine dietary tags
  const getDietaryFlags = (dish: MenuItem) => {
    const isVegetarian =
      dish.tags?.some((t) => /végé/i.test(t)) ||
      dish.name.toLowerCase().includes('veggie') ||
      dish.name.toLowerCase().includes('burrata');
    const isSpicy =
      dish.tags?.some((t) => /épic|piment|spicy/i.test(t)) ||
      dish.description.toLowerCase().includes('piment');
    const isChefSpecial = dish.tags?.some((t) => /signature|chef|coup de cœur|incontournable/i.test(t));
    return { isVegetarian, isSpicy, isChefSpecial };
  };

  // ---------- Page building blocks (designed at 480 x 680) ----------
  const renderDishRow = (dish: MenuItem) => {
    const isQuickAdded = quickAddedId === dish.id;
    const { isVegetarian, isSpicy, isChefSpecial } = getDietaryFlags(dish);

    return (
      <div
        key={dish.id}
        onClick={() => handleOpenDish(dish)}
        className={`group relative cursor-pointer flex gap-3 px-2 py-2 -mx-2 rounded-xl transition-colors duration-200 active:bg-orange-500/[0.10] hover:bg-orange-500/[0.06] ${
          !dish.is_available ? 'opacity-60' : ''
        }`}
      >
        <div className="relative w-[58px] h-[58px] shrink-0 rounded-full overflow-hidden border-2 border-[#E85D04]/25 shadow-sm">
          <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" draggable={false} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h4 className="text-[15px] leading-tight font-bold text-[#2B2D42] group-hover:text-[#E85D04] transition-colors truncate">
              {dish.name}
            </h4>
            <div className="flex-1 border-b border-dotted border-[#CFC5B4] min-w-[12px] translate-y-[-3px]" />
            <span className="text-[15px] font-extrabold text-[#E85D04] font-serif shrink-0">
              {formatMoney(dish.price, dish.currency)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 h-4">
            {isVegetarian && (
              <span title="Végétarien" className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700">
                <Leaf className="w-3 h-3" /> Végé
              </span>
            )}
            {isSpicy && (
              <span title="Épicé" className="flex items-center gap-0.5 text-[10px] font-semibold text-red-600">
                <Flame className="w-3 h-3" /> Épicé
              </span>
            )}
            {isChefSpecial && (
              <span title="Coup de cœur Chef" className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                <Sparkles className="w-3 h-3" /> Chef
              </span>
            )}
            {!dish.is_available && (
              <span className="px-1.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold uppercase tracking-wider">
                Épuisé
              </span>
            )}
          </div>

          <p className="text-[12px] text-[#555870] leading-snug mt-0.5 pr-10 line-clamp-2">{dish.description}</p>
        </div>

        <button
          type="button"
          disabled={!dish.is_available}
          onClick={(e) => handleQuickAdd(e, dish)}
          className={`absolute right-1 bottom-2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
            isQuickAdded
              ? 'bg-emerald-600 text-white scale-110'
              : 'bg-[#FFFDF9] text-[#E85D04] border border-[#E8E1D5] hover:bg-[#E85D04] hover:text-white active:scale-90 disabled:opacity-40'
          }`}
          title="Ajouter au panier"
          aria-label={`Ajouter ${dish.name} au panier`}
        >
          {isQuickAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
    );
  };

  const renderPageFooter = (pageIndex: number) => (
    <div className="absolute left-8 right-8 bottom-5 flex items-center justify-between text-[11px] text-[#8C8275] border-t border-[#E8E1D5] pt-2.5">
      <span className="font-serif italic">Produits frais & faits maison</span>
      <span className="font-serif font-bold text-[#6B4226]">— {pageIndex + 1} —</span>
      <span className="font-semibold tracking-wider">MAT HOUSE</span>
    </div>
  );

  const renderCover = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-10">
      <div className="absolute inset-5 border border-[#D4AF37]/45 rounded-xl pointer-events-none" />
      <div className="absolute inset-7 border border-[#D4AF37]/20 rounded-lg pointer-events-none" />

      <div className="relative w-[340px] h-[100px]">
        <Image src="/logo-cropped.png" alt="Mat House Restaurant" fill className="object-contain" priority />
      </div>

      <div className="w-24 h-px bg-[#D4AF37]/60 my-6" />

      <p className="font-script text-[30px] text-[#F5E6B3] leading-none">Cuisine d’Émotion & Terroir</p>
      <p className="mt-3 text-[11px] tracking-[0.35em] uppercase text-[#D4AF37]/85 font-semibold">La Carte</p>

      <div className="mt-10 px-5 py-1.5 rounded-full border border-[#D4AF37]/50 text-[#F5E6B3] text-sm font-bold tracking-widest">
        {placeLabel(config.tableNumber).toUpperCase()}
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-2 text-[#F5E6B3]/80 text-[13px] animate-pulse-slow">
        <Hand className="w-4 h-4" />
        <span>Glissez ou touchez le coin pour tourner les pages</span>
      </div>
    </div>
  );

  const renderToc = (pageIndex: number) => (
    <div className="relative w-full h-full px-9 pt-10">
      <p className="text-[11px] uppercase tracking-[0.3em] text-[#E85D04] font-extrabold">Bienvenue</p>
      <h2 className="text-[38px] font-bold font-serif text-[#2B2D42] leading-tight">Sommaire</h2>
      <p className="font-script text-[20px] text-[#E85D04] -mt-1">Touchez une rubrique pour y aller</p>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1">
        {BOOK_CATEGORIES.map((category) => {
          const page = firstPageOfCategory[category];
          const meta = CATEGORY_META[category];
          const disabled = page === undefined;
          return (
            <button
              key={category}
              type="button"
              disabled={disabled}
              onClick={() => {
                playTapSound();
                if (page !== undefined) turnToPage(page);
              }}
              className="w-full flex items-center gap-2.5 py-1.5 px-1.5 -mx-1.5 rounded-xl text-left transition-colors hover:bg-orange-500/[0.06] active:bg-orange-500/[0.12] disabled:opacity-35"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E85D04]/25 shrink-0">
                <img src={meta.headerImage} alt="" className="w-full h-full object-cover" draggable={false} />
              </div>
              <span className="flex-1 min-w-0 text-[13px] font-bold font-serif text-[#2B2D42] leading-tight [overflow-wrap:anywhere]">{category}</span>
              <span className="font-serif font-bold text-[#E85D04] text-[14px] w-6 text-right shrink-0">
                {page !== undefined ? page + 1 : '–'}
              </span>
            </button>
          );
        })}
      </div>

      {renderPageFooter(pageIndex)}
    </div>
  );

  const renderCategoryPage = (
    model: Extract<BookPageModel, { kind: 'category' }>,
    pageIndex: number
  ) => {
    const meta = CATEGORY_META[model.category];
    return (
      <div className="relative w-full h-full px-8 pt-8">
        {model.part === 0 ? (
          <div className="flex items-center gap-4 pb-4 mb-3 border-b border-[#E8E1D5]">
            <div className="w-[68px] h-[68px] rounded-full overflow-hidden border-2 border-[#E85D04]/40 ring-4 ring-[#E85D04]/10 shadow-md shrink-0">
              <img src={meta.headerImage} alt={model.category} className="w-full h-full object-cover" draggable={false} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C8275] font-bold">{meta.english}</span>
              <h2 className="text-[32px] font-bold font-serif text-[#2B2D42] leading-none mt-0.5">{model.category}</h2>
              <p className="font-script text-[19px] text-[#E85D04] leading-tight mt-0.5">{meta.scriptTag}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-baseline justify-between pb-2 mb-3 border-b border-[#E8E1D5]">
            <h2 className="text-[22px] font-bold font-serif text-[#2B2D42]">
              {model.category} <span className="font-script text-[18px] text-[#E85D04] font-normal">(suite)</span>
            </h2>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C8275] font-bold">{meta.english}</span>
          </div>
        )}

        <div className="space-y-1.5">{model.items.map(renderDishRow)}</div>

        {renderPageFooter(pageIndex)}
      </div>
    );
  };

  const renderEmpty = (pageIndex: number) => (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-10">
      <Search className="w-10 h-10 text-[#E85D04]/60 mb-4" />
      <p className="text-[22px] font-serif font-bold text-[#2B2D42]">Aucun mets ne correspond</p>
      <p className="text-[13px] text-[#555870] mt-1">à « {searchQuery} »</p>
      <button
        type="button"
        onClick={() => setSearchQuery('')}
        className="mt-6 px-5 py-2 rounded-full bg-[#E85D04] text-white text-sm font-bold active:scale-95"
      >
        Voir toute la carte
      </button>
      {renderPageFooter(pageIndex)}
    </div>
  );

  const renderNotes = (pageIndex: number) => (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-12">
      <p className="font-script text-[34px] text-[#E85D04]">Merci de votre visite</p>
      <p className="text-[13px] text-[#555870] mt-3 leading-relaxed">
        Toutes nos préparations sont réalisées sur place à partir de produits frais. N’hésitez pas à demander
        conseil à notre équipe pour les accords mets & vins.
      </p>
      <p className="text-[11px] text-[#8C8275] mt-6 italic">
        Liste des allergènes disponible sur simple demande. Prix nets, service compris.
      </p>
      {renderPageFooter(pageIndex)}
    </div>
  );

  const renderBack = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-10">
      <div className="absolute inset-5 border border-[#D4AF37]/45 rounded-xl pointer-events-none" />
      <p className="text-[11px] tracking-[0.35em] uppercase text-[#D4AF37]/85 font-semibold">Coup de cœur de la maison</p>

      {chefSpecial && (
        <button
          type="button"
          onClick={() => handleOpenDish(chefSpecial)}
          className="mt-6 flex flex-col items-center group"
        >
          <div className="w-[200px] h-[200px] rounded-full overflow-hidden border-4 border-[#D4AF37]/60 shadow-2xl">
            <img
              src={chefSpecial.image_url}
              alt={chefSpecial.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              draggable={false}
            />
          </div>
          <h3 className="mt-5 text-[24px] font-serif font-bold text-[#F5E6B3] leading-tight">{chefSpecial.name}</h3>
          <span className="mt-3 px-5 py-2 rounded-full bg-[#E85D04] text-white text-sm font-bold shadow-lg active:scale-95">
            Découvrir • {formatMoney(chefSpecial.price, chefSpecial.currency)}
          </span>
        </button>
      )}

      <p className="font-script text-[34px] text-[#F5E6B3] mt-10">Bon appétit !</p>
      <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37]/70 mt-1">Mat House Restaurant</p>
    </div>
  );

  const pages: FlipBookPage[] = pageModels.map((model, index) => {
    switch (model.kind) {
      case 'cover':
        return { key: 'cover', skin: 'leather', content: renderCover() };
      case 'toc':
        return { key: 'toc', content: renderToc(index) };
      case 'category':
        return { key: `${model.category}-${model.part}`, content: renderCategoryPage(model, index) };
      case 'empty':
        return { key: 'empty', content: renderEmpty(index) };
      case 'notes':
        return { key: 'notes', content: renderNotes(index) };
      case 'back':
        return { key: 'back', skin: 'leather', content: renderBack() };
    }
  });

  return (
    <div className="relative isolate w-full h-full flex flex-col select-none overflow-hidden text-slate-100">
      {/* 1. ATMOSPHERIC RESTAURANT BACKGROUND (BEHIND THE BOOK) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.22] contrast-[1.15] scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C11] via-[#121318]/90 to-[#121318]/95" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-amber-500/[0.06] rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Tablet Header Bar */}
      <header className="glass-panel shrink-0 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3 z-30 border-b border-[#E85D04]/25 shadow-2xl backdrop-blur-xl">
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
            {placeLabel(config.tableNumber).toUpperCase()}
          </div>

          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-[#FAA307]" />
            <span>
              {peopleCount} {peopleCount === 1 ? 'convive' : 'convives'}
            </span>
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
          title={guestMode ? 'Contacter le restaurant' : 'Appeler un serveur à votre table'}
        >
          <Bell className={`w-4 h-4 ${waiterCalled ? 'text-emerald-400 rotate-12' : 'text-[#FAA307]'}`} />
          <span className="hidden md:inline">{waiterCalled ? 'Prévenu' : guestMode ? 'Restaurant' : 'Serveur'}</span>
        </button>
      </header>

      {/* Category tabs: turn the book to the chosen section */}
      <div className="shrink-0 px-4 sm:px-8 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-[#0e131d]/85 backdrop-blur-md z-20">
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat;
          const targetPage = cat === 'Toutes' ? 1 : firstPageOfCategory[cat];
          return (
            <button
              key={cat}
              disabled={targetPage === undefined}
              onClick={() => {
                playTapSound();
                if (targetPage !== undefined) turnToPage(targetPage);
              }}
              className={`min-h-[36px] px-4 sm:px-5 py-1 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 border disabled:opacity-30 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#E85D04] via-[#F48C06] to-[#E85D04] text-white border-transparent shadow-[0_4px_16px_rgba(232,93,4,0.4)] scale-105'
                  : 'bg-[#1A1D27]/90 text-[#E8E1D5] border-white/10 hover:border-[#E85D04]/40 hover:text-white'
              }`}
            >
              {cat === 'Toutes' ? 'Sommaire' : cat}
            </button>
          );
        })}

        {searchQuery && (
          <button
            onClick={() => {
              playTapSound();
              setSearchQuery('');
            }}
            className="flex items-center gap-1 text-xs text-[#FAA307] hover:underline ml-auto font-bold whitespace-nowrap shrink-0 pl-2"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Effacer la recherche</span>
          </button>
        )}
      </div>

      {/* THE FLIP-BOOK: always fits the remaining screen space */}
      <div className={`flex-1 min-h-0 px-3 sm:px-6 pt-4 ${cartHasItems ? 'pb-24 sm:pb-28' : 'pb-4'}`}>
        <FlipBook pages={pages} request={pageRequest} onPageChange={setCurrentPage} />
      </div>

      {/* Dish Detail & Customization Modal */}
      <DishDetailModal dish={selectedDish} isOpen={isDishModalOpen} onClose={() => setIsDishModalOpen(false)} />
    </div>
  );
};
