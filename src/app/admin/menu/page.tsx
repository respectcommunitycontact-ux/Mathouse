'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategory } from '@/types';
import { DataService } from '@/lib/data-service';
import { Plus, Search, Pencil, X, Save, Utensils } from 'lucide-react';
import { playTapSound } from '@/lib/sound';
import { DishImageUploader } from '@/components/admin/DishImageUploader';
import {
  AvailabilitySwitch,
  Card,
  CountPill,
  EmptyState,
  PageContainer,
  PageHeader,
  btn,
  formatEuro,
  inputClass,
} from '@/components/admin/ui';

const MENU_CATEGORIES: MenuCategory[] = ['Entrées', 'Plats', 'Spécialités', 'Desserts', 'Boissons', 'Vins'];

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Toutes' | MenuCategory>('Toutes');
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    DataService.getMenuItems().then(setMenuItems);
  }, []);

  const handleToggleAvailability = async (id: string) => {
    playTapSound();
    const newStatus = await DataService.toggleMenuItemAvailability(id);
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_available: newStatus } : item)));
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;
    playTapSound();
    await DataService.updateMenuItem(editingDish);
    setMenuItems(await DataService.getMenuItems());
    setEditingDish(null);
    setIsCreatingNew(false);
  };

  const handleAddNew = () => {
    playTapSound();
    setEditingDish({
      id: `m-${Date.now()}`,
      name: '',
      description: '',
      price: 15.0,
      category: selectedCategory === 'Toutes' ? 'Plats' : selectedCategory,
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      is_available: true,
      tags: ['Nouveau'],
      preparation_time_minutes: 15,
    });
    setIsCreatingNew(true);
  };

  const openEdit = (dish: MenuItem) => {
    playTapSound();
    setEditingDish(dish);
    setIsCreatingNew(false);
  };

  // Close the dialog with Escape
  useEffect(() => {
    if (!editingDish) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setEditingDish(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingDish]);

  const q = searchQuery.toLowerCase();
  const filteredItems = menuItems.filter((it) => {
    const matchesCategory = selectedCategory === 'Toutes' || it.category === selectedCategory;
    const matchesSearch = !q || it.name.toLowerCase().includes(q) || it.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const categoryGroups = MENU_CATEGORIES.map((cat) => ({
    category: cat,
    items: filteredItems.filter((item) => item.category === cat),
  })).filter((group) => group.items.length > 0);

  const outOfStock = menuItems.filter((m) => !m.is_available).length;
  const countFor = (cat: 'Toutes' | MenuCategory) =>
    cat === 'Toutes' ? menuItems.length : menuItems.filter((m) => m.category === cat).length;

  return (
    <PageContainer>
      <PageHeader
        title="Carte & stocks"
        description="Modifiez les plats, prix et photos affichés sur les tablettes. Désactivez un plat pour le mettre en rupture : il ne pourra plus être commandé."
        meta={
          <>
            <CountPill>{menuItems.length} plats</CountPill>
            {outOfStock > 0 && <CountPill tone="danger">{outOfStock} en rupture</CountPill>}
          </>
        }
        actions={
          <>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un plat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
            <button onClick={handleAddNew} className={btn.primary}>
              <Plus className="w-4 h-4" />
              Ajouter un plat
            </button>
          </>
        }
      />

      {/* Category tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-5 overflow-x-auto">
        {(['Toutes', ...MENU_CATEGORIES] as const).map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                playTapSound();
                setSelectedCategory(cat);
              }}
              className={`relative px-3.5 h-10 text-sm font-semibold whitespace-nowrap transition ${
                active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat} <span className="text-slate-400 font-medium">{countFor(cat)}</span>
              {active && <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-[#E85D04] rounded-full" />}
            </button>
          );
        })}
      </div>

      {categoryGroups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Utensils className="w-5 h-5" />}
            title="Aucun plat ne correspond"
            hint="Changez de catégorie ou effacez la recherche."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {categoryGroups.map((group) => (
            <Card key={group.category} className="overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">{group.category}</h2>
                <span className="text-xs text-slate-500">{group.items.length} plat{group.items.length > 1 ? 's' : ''}</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {group.items.map((dish) => (
                  <li key={dish.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`w-14 h-14 rounded-lg bg-slate-100 bg-cover bg-center shrink-0 border border-slate-200 flex items-center justify-center ${
                          dish.is_available ? '' : 'grayscale opacity-60'
                        }`}
                        style={{ backgroundImage: dish.image_url ? `url(${dish.image_url})` : 'none' }}
                      >
                        {!dish.image_url && <Utensils className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-semibold ${dish.is_available ? 'text-slate-900' : 'text-slate-500'}`}>
                            {dish.name}
                          </p>
                          {dish.tags?.slice(0, 2).map((t) => (
                            <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-2xl">{dish.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-5 shrink-0 justify-between sm:justify-end">
                      <span className="text-sm font-semibold text-slate-900 w-20 text-right">{formatEuro(dish.price)}</span>
                      <AvailabilitySwitch available={dish.is_available} onToggle={() => handleToggleAvailability(dish.id)} />
                      <button onClick={() => openEdit(dish)} className={btn.ghost} title="Modifier ce plat">
                        <Pencil className="w-4 h-4" />
                        Modifier
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / create dialog */}
      {editingDish && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setEditingDish(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dish-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg max-h-[92vh] flex flex-col rounded-xl shadow-2xl"
          >
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 id="dish-dialog-title" className="text-lg font-semibold text-slate-900">
                  {isCreatingNew ? 'Ajouter un plat' : 'Modifier le plat'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Les changements apparaissent aussitôt sur les tablettes.</p>
              </div>
              <button onClick={() => setEditingDish(null)} className={btn.ghost + ' w-9 px-0'} aria-label="Fermer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label htmlFor="dish-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nom du plat
                </label>
                <input
                  id="dish-name"
                  type="text"
                  required
                  placeholder="Ex. : Filet de bœuf, sauce au poivre"
                  value={editingDish.name}
                  onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dish-category" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Catégorie
                  </label>
                  <select
                    id="dish-category"
                    value={editingDish.category}
                    onChange={(e) => setEditingDish({ ...editingDish, category: e.target.value as MenuCategory })}
                    className={inputClass}
                  >
                    {MENU_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="dish-price" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Prix (€)
                  </label>
                  <input
                    id="dish-price"
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={editingDish.price}
                    onChange={(e) => setEditingDish({ ...editingDish, price: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dish-description" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  id="dish-description"
                  rows={3}
                  placeholder="Ingrédients, cuisson, accompagnement…"
                  value={editingDish.description}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                  className={`${inputClass} h-auto py-2`}
                />
                <p className="text-xs text-slate-500 mt-1">Affichée sous le nom du plat sur la carte des tablettes.</p>
              </div>

              <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-sm font-medium text-slate-700">Disponible à la commande</p>
                  <p className="text-xs text-slate-500">Désactivez si le plat est en rupture.</p>
                </div>
                <AvailabilitySwitch
                  available={editingDish.is_available}
                  onToggle={() => setEditingDish({ ...editingDish, is_available: !editingDish.is_available })}
                  compact
                />
              </div>

              <DishImageUploader
                value={editingDish.image_url}
                onChange={(url) => setEditingDish({ ...editingDish, image_url: url })}
              />

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setEditingDish(null)} className={btn.secondary}>
                  Annuler
                </button>
                <button type="submit" className={btn.primary}>
                  <Save className="w-4 h-4" />
                  {isCreatingNew ? 'Ajouter le plat' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
