'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategory } from '@/types';
import { DataService } from '@/lib/data-service';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  X,
  Save,
  List,
  LayoutGrid,
  Utensils
} from 'lucide-react';
import { playTapSound } from '@/lib/sound';
import { DishImageUploader } from '@/components/admin/DishImageUploader';

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // Default to Authentic Restaurant List View

  useEffect(() => {
    DataService.getMenuItems().then(setMenuItems);
  }, []);

  const handleToggleAvailability = async (id: string) => {
    playTapSound();
    const newStatus = await DataService.toggleMenuItemAvailability(id);
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_available: newStatus } : item))
    );
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;
    playTapSound();

    await DataService.updateMenuItem(editingDish);
    const updated = await DataService.getMenuItems();
    setMenuItems(updated);
    setEditingDish(null);
    setIsCreatingNew(false);
  };

  const handleAddNew = () => {
    playTapSound();
    const newDish: MenuItem = {
      id: `m-${Date.now()}`,
      name: '',
      description: '',
      price: 15.0,
      category: 'Plats',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      is_available: true,
      tags: ['Nouveau'],
      preparation_time_minutes: 15,
    };
    setEditingDish(newDish);
    setIsCreatingNew(true);
  };

  const categories: ('Toutes' | MenuCategory)[] = [
    'Toutes',
    'Entrées',
    'Plats',
    'Spécialités',
    'Desserts',
    'Boissons',
    'Vins',
  ];

  const filteredItems = menuItems.filter((it) => {
    const matchesCategory = selectedCategory === 'Toutes' || it.category === selectedCategory;
    const matchesSearch =
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group items by category for authentic restaurant menu list view
  const categoryGroups = (['Entrées', 'Plats', 'Spécialités', 'Desserts', 'Boissons', 'Vins'] as MenuCategory[])
    .map((cat) => ({
      category: cat,
      items: filteredItems.filter((item) => item.category === cat),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0E14]/75 backdrop-blur-sm p-4 sm:p-6 lg:p-8 select-none overflow-hidden space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08] shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-3">
            <span>Gestion du Menu</span>
            <span className="text-xs px-3 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/30 font-bold font-mono">
              {menuItems.length} plats
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-light mt-1">
            Présentation authentique style carte de restaurant &amp; contrôle en temps réel des stocks.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un mets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[#121722] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition"
            />
          </div>

          {/* View Switcher: List (Menu Restaurant) vs Grid */}
          <div className="flex items-center bg-[#121722] p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => {
                playTapSound();
                setViewMode('list');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-[#D4AF37] text-[#0B0E14] font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vue Carte Restaurant (Liste)"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Menu Liste</span>
            </button>
            <button
              onClick={() => {
                playTapSound();
                setViewMode('grid');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-[#D4AF37] text-[#0B0E14] font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vue Grille"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Grille</span>
            </button>
          </div>

          {/* Add New Dish */}
          <button
            onClick={handleAddNew}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0E14] text-xs font-black flex items-center gap-2 shadow-sm transition border border-[#E5C158]/50 shrink-0 whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#0B0E14]" />
            <span>Nouveau Plat</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="py-1 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playTapSound();
              setSelectedCategory(cat);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#D4AF37]/15 text-[#E5C158] border-[#D4AF37]/40 font-bold shadow-sm'
                : 'bg-[#121722] text-slate-400 border-white/[0.06] hover:border-white/20 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* VIEW MODE 1: AUTHENTIC RESTAURANT MENU LIST VIEW */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-y-auto pr-1.5 pb-6 custom-scrollbar space-y-8">
          {categoryGroups.length === 0 ? (
            <div className="text-center py-16 bg-[#121722]/50 rounded-3xl border border-white/5">
              <p className="text-sm text-slate-400">Aucun plat ne correspond à votre recherche.</p>
            </div>
          ) : (
            categoryGroups.map((group) => (
              <div key={group.category} className="bg-[#121722]/90 rounded-3xl border border-white/[0.08] p-5 sm:p-7 shadow-xl">
                {/* Authentic Category Header with Gold Accents */}
                <div className="flex items-center gap-4 mb-6 pb-3 border-b border-[#D4AF37]/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <span>{group.category}</span>
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF37]/30 to-transparent" />
                  <span className="text-xs font-mono font-semibold text-[#E5C158] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
                    {group.items.length} mets
                  </span>
                </div>

                {/* List Items (Restaurant Menu Layout) */}
                <div className="divide-y divide-white/[0.06]">
                  {group.items.map((dish) => (
                    <div
                      key={dish.id}
                      className={`py-4 sm:py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                        !dish.is_available ? 'opacity-65' : ''
                      }`}
                    >
                      {/* Left Block: Image Thumbnail + Details */}
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        {/* Image Thumbnail with Fallback */}
                        <div 
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cover bg-center shrink-0 bg-[#0B0E14] border border-white/10 shadow-md relative overflow-hidden flex items-center justify-center"
                          style={{ backgroundImage: dish.image_url ? `url(${dish.image_url})` : 'none' }}
                        >
                          {!dish.image_url && (
                            <Utensils className="w-6 h-6 text-[#D4AF37]/40" />
                          )}
                          {!dish.is_available && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center">
                              <span className="text-[9px] font-black uppercase text-rose-400">Rupture</span>
                            </div>
                          )}
                        </div>

                        {/* Text Block with Dotted Leader Line styling */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <h4 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
                              {dish.name}
                            </h4>

                            {dish.tags && dish.tags.length > 0 && (
                              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#E5C158] text-[10px] font-bold border border-[#D4AF37]/30 uppercase tracking-wider">
                                {dish.tags[0]}
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-slate-400 font-light mt-1 leading-relaxed max-w-2xl">
                            {dish.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Block: Price + Dotted Leader + Quick Stock Toggle + Edit */}
                      <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                        {/* Price Tag */}
                        <span className="text-base sm:text-lg font-serif font-extrabold text-[#E5C158] font-mono whitespace-nowrap">
                          {dish.price.toFixed(2)} €
                        </span>

                        <div className="h-6 w-px bg-white/10 hidden sm:block" />

                        {/* Stock Toggle Button */}
                        <button
                          onClick={() => handleToggleAvailability(dish.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border active:scale-95 whitespace-nowrap ${
                            dish.is_available
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                          }`}
                        >
                          {dish.is_available ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>En Stock</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>En Rupture</span>
                            </>
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            playTapSound();
                            setEditingDish(dish);
                            setIsCreatingNew(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition border border-white/10 flex items-center gap-1.5 text-xs font-semibold active:scale-95 whitespace-nowrap"
                          title="Modifier le plat"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Modifier</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW MODE 2: GRID CARDS VIEW */}
      {viewMode === 'grid' && (
        <div className="flex-1 overflow-y-auto pr-1 pb-4 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((dish) => (
              <div
                key={dish.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between shadow-md transition-all ${
                  dish.is_available
                    ? 'bg-[#121722] border-white/[0.08] hover:border-white/20'
                    : 'bg-[#161214] border-rose-950/50 opacity-80'
                }`}
              >
                <div className="flex gap-3.5">
                  <div
                    className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0 bg-[#0B0E14] border border-white/10 shadow-inner relative overflow-hidden"
                    style={{ backgroundImage: `url(${dish.image_url})` }}
                  >
                    {!dish.is_available && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase text-rose-400 text-center px-1">Rupture</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="text-sm font-bold font-serif text-white truncate" title={dish.name}>{dish.name}</h4>
                      <span className="text-sm font-black text-[#E5C158] font-mono whitespace-nowrap shrink-0">
                        {dish.price.toFixed(2)} €
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 inline-block my-1 font-semibold">
                      {dish.category}
                    </span>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-light">{dish.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06]">
                  <button
                    onClick={() => handleToggleAvailability(dish.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border active:scale-95 ${
                      dish.is_available
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    {dish.is_available ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>En Stock</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>En Rupture</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      playTapSound();
                      setEditingDish(dish);
                      setIsCreatingNew(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition border border-white/10 flex items-center gap-1.5 text-xs font-semibold active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Modifier</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit / Create Dish Modal */}
      {editingDish && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121722] border border-white/15 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4 sticky top-0 bg-[#121722] z-10">
              <h3 className="text-lg font-serif font-bold text-white">
                {isCreatingNew ? 'Ajouter un plat' : 'Modifier le plat'}
              </h3>
              <button
                onClick={() => setEditingDish(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom du plat</label>
                <input
                  type="text"
                  required
                  value={editingDish.name}
                  onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0E14] border border-white/15 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Catégorie</label>
                  <select
                    value={editingDish.category}
                    onChange={(e) =>
                      setEditingDish({ ...editingDish, category: e.target.value as MenuCategory })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0E14] border border-white/15 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                  >
                    {categories.filter((c) => c !== 'Toutes').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prix (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingDish.price}
                    onChange={(e) =>
                      setEditingDish({ ...editingDish, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0E14] border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description gastronomique</label>
                <textarea
                  rows={3}
                  value={editingDish.description}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0E14] border border-white/15 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <DishImageUploader
                value={editingDish.image_url}
                onChange={(url) => setEditingDish({ ...editingDish, image_url: url })}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-semibold hover:bg-white/10 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0E14] font-black flex items-center gap-2 transition active:scale-95 shadow-sm"
                >
                  <Save className="w-4 h-4 text-[#0B0E14]" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
