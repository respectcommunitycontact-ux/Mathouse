'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useTabletStore } from '@/store/tabletStore';
import { DataService } from '@/lib/data-service';
import { ArrowLeft, Send, User, MessageCircle, AlertCircle, Sparkles } from 'lucide-react';
import { playTapSound } from '@/lib/sound';

export const CheckoutModal: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { 
    config, 
    peopleCount, 
    customerSession, 
    saveCustomerSession, 
    setLastOrderInfo, 
    setActiveScreen 
  } = useTabletStore();

  const [fullName, setFullName] = useState(customerSession?.fullName || '');
  const [whatsapp, setWhatsapp] = useState(customerSession?.whatsapp || '');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (customerSession) {
      setFullName(customerSession.fullName);
      setWhatsapp(customerSession.whatsapp);
    }
  }, [customerSession]);

  const totalPrice = getTotalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();

    const cleanName = fullName.trim();
    const cleanWa = whatsapp.trim();

    if (!cleanName) {
      setErrorMessage('Veuillez indiquer le nom du responsable de table.');
      return;
    }

    if (!cleanWa || cleanWa.length < 8) {
      setErrorMessage('Veuillez saisir un numéro WhatsApp valide pour le suivi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Save Customer Session
      saveCustomerSession(cleanName, cleanWa);

      // 2. Prepare Order Object
      const newOrder = await DataService.createOrder({
        table_number: config.tableNumber,
        people_count: peopleCount,
        total: totalPrice,
        status: 'nouvelle',
        notes: orderNotes.trim() || undefined,
        customer: {
          id: `cust-${Date.now()}`,
          full_name: cleanName,
          whatsapp: cleanWa,
          total_orders: 1,
          last_visit: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        items: items.map((it) => ({
          id: '',
          order_id: '',
          menu_item_id: it.menu_item.id,
          item_name: it.menu_item.name,
          item_price: it.menu_item.price,
          quantity: it.quantity,
          person_label: it.person_label,
          special_instructions: it.special_instructions,
        })),
      });

      // 3. Clear cart and set last order reference
      clearCart();
      setLastOrderInfo(newOrder.id, newOrder.order_number);

      // 4. Move to confirmation screen
      setActiveScreen('confirmation');
    } catch (err) {
      console.error('Error submitting order:', err);
      setErrorMessage('Une erreur est survenue lors de l\'envoi en cuisine. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-12 select-none overflow-y-auto bg-[#0B0E14] text-slate-100">
      {/* Background Ambience & Lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121824] via-[#0B0E14] to-[#080B10] opacity-95 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <button
          onClick={() => {
            playTapSound();
            setActiveScreen('menu');
          }}
          className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-2 text-xs sm:text-sm font-semibold border border-white/15 transition backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
          <span>Retour au menu</span>
        </button>

        <div className="px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E5C158] text-xs font-extrabold uppercase tracking-widest shadow-gold-subtle">
          <span>TABLE {config.tableNumber} &bull; VALIDATION</span>
        </div>
      </div>

      {/* Center Validation Form */}
      <div className="relative z-10 max-w-lg w-full mx-auto my-auto py-4 sm:py-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mx-auto mb-3 shadow-gold-subtle">
            <Send className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-2">
            Finaliser la commande
          </h2>
          <p className="text-slate-400 text-xs sm:text-base font-light">
            Montant global de la table :{' '}
            <span className="text-[#D4AF37] font-serif font-extrabold text-xl sm:text-2xl ml-1 gold-gradient-text">{totalPrice.toFixed(2)} €</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 glass-panel p-6 sm:p-9 rounded-3xl border border-[#D4AF37]/30 shadow-2xl">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* CRM Field 1: Nom du responsable */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-widest text-[#D4AF37] mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#D4AF37]" />
              <span>Nom du responsable de table <span className="text-[#D4AF37]">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Alexandre Dumas"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-[#0B0E14] border border-white/15 text-white font-medium text-sm placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300"
            />
          </div>

          {/* CRM Field 2: Numéro WhatsApp */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-widest text-[#D4AF37] mb-2 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Numéro WhatsApp <span className="text-[#D4AF37]">*</span></span>
            </label>
            <input
              type="tel"
              required
              placeholder="Ex: 06 12 34 56 78 ou +33612345678"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-[#0B0E14] border border-white/15 text-white font-medium text-sm placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300"
            />
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 font-light">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Suivi en direct de votre préparation &amp; avantages fidélité.</span>
            </p>
          </div>

          {/* Note cuisine (optionnelle) */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">
              Remarque globale pour le Chef (optionnel)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Servir les entrées simultanément..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-[#0B0E14] border border-white/15 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all duration-300 resize-none"
            />
          </div>

          {/* Action Submit Button Capsule */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full shimmer-effect min-h-[58px] py-4 px-6 rounded-full font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl transition-all duration-300 active:scale-[0.99] border ${
              isSubmitting
                ? 'bg-slate-800 text-slate-400 cursor-wait border-transparent'
                : 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#E5C158] hover:to-[#F5E6B3] text-[#0B0E14] shadow-gold-subtle hover:shadow-gold-lg border-[#F5E6B3]/60'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-[#0B0E14] border-t-transparent rounded-full animate-spin" />
                Transmission immédiate en cuisine...
              </span>
            ) : (
              <>
                <Send className="w-5 h-5 text-[#0B0E14] font-bold" />
                <span>Envoyer la commande en cuisine</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-slate-500 font-light">
        Vos données sont sécurisées et destinées uniquement au service de votre table.
      </div>
    </div>
  );
};
