---
name: restotablet-ui-ux-design
description: Guide et système de design UI/UX complet pour RestoTablet Pro. À utiliser pour concevoir, réviser, styliser et optimiser les interfaces du kiosque tablette client et de la console d'administration (KDS, menu, parc de tables, CRM). Garantit une esthétique gastronomique haut de gamme, des composants glassmorphism et une ergonomie tactile parfaite.
---

# Système de Design UI/UX RestoTablet Pro

Cette compétence définit les standards de conception visuelle, d'ergonomie tactile et d'architecture de composants pour l'application **RestoTablet Pro**.

---

## 1. Principes Directeurs UI/UX

1. **Esthétique Gastronomique & Effet "Wow"** :
   - Fond sombre profond (`#0B0E14`), accents Or Gastronomique (`#D4AF37`, `#E5C158`) et effets de transparence en verre dépoli (*glassmorphism*).
   - Typographie raffinée combinant **Playfair Display** (pour les titres et plats) et **Plus Jakarta Sans** (pour la lisibilité et les chiffres).
2. **Ergonomie Tactile pour Tablette en Salle** :
   - Zone tactile minimale (*touch target*) de **48px × 48px** (idéalement 56px pour les actions principales).
   - Retours visuels et sonores immédiats à chaque interaction (*active:scale-95*, sons de tap et carillon sonore).
3. **Clarté d'Information en Service Intenxif** :
   - Codes couleurs sans ambiguïté : 
     - **Émeraude (`#10B981`)** : Libre / En Stock / Validé
     - **Or / Ambre (`#D4AF37`)** : En préparation / Addition demandée / Spécialité
     - **Rose / Rouge (`#F43F5E`)** : Appel serveur urgent / Rupture de stock / Annulé
     - **Bleu (`#3B82F6`)** : En cours de dégustation / Table occupée
4. **Zéro Temps Mort** :
   - Actions directes à 1 tap sans modales inutiles (ex: basculement d'état de stock, acquittement d'appel serveur).

---

## 2. Palette de Couleurs & Tokens CSS

```css
:root {
  /* Fond principal */
  --bg-main: #0B0E14;
  --bg-card: #121824;
  --bg-panel: rgba(15, 20, 29, 0.75);

  /* Accents Or Gastronomique */
  --gold-primary: #D4AF37;
  --gold-light: #E5C158;
  --gold-glow: rgba(212, 175, 55, 0.35);

  /* États fonctionnels */
  --status-free: #10B981;       /* Émeraude */
  --status-[#D4AF37]: #D4AF37;   /* Or */
  --status-alert: #F43F5E;      /* Rose alerte */
  --status-busy: #3B82F6;       /* Bleu */
}
```

---

## 3. Composants Clés & Spécifications Visuelles

### A. Cartes de Plats Kiosque & Menu Admin
- **Coins arrondis** : `rounded-3xl` (24px).
- **Bordures** : Subtiles `border border-white/10` devenant `border-[#D4AF37]/40` au survol ou au tap.
- **Photos** : Ratio harmonieux avec overlay dégradé sombre pour faire ressortir le titre.
- **Pillules de Stock** : Boutons "En Stock" (Émeraude) / "En Rupture" (Rose) très lisibles.

### B. Barre de Navigation Admin (`AdminNavbar`)
- **Glassmorphism Header** : Floutage de fond `backdrop-blur-xl`.
- **Badges dynamiques** : Pastilles numérotées sur les onglets avec animation `animate-pulse` sur les alertes serveur.

### C. Tableau de Bord Central (`/admin`)
- **Cartes KPIs** : Valeurs numériques grand format (`text-2xl` à `text-3xl`), icônes contrastées avec fond coloré à 15% d'opacité.
- **Bannière d'Urgence** : Rouge alerte avec bouton "Tout Acquitter" et "Acquitter T{N}".

### D. KDS Cuisine Kanban (`/admin/cuisine`)
- **Colonnes Kanban** : Cartes glissables (*drag & drop*) ou à bouton unique grand format *"Marquer Servie"*.
- **Chrono visuel** : Badge de temps écoulé changeant de couleur (Blanc <10min, Or 10-20min, Rouge >20min).

---

## 4. Checklist de Révision UI/UX pour tout Nouveau Composant

- [ ] La zone cliquable/tactile respecte-t-elle au moins 48px de hauteur/largeur ?
- [ ] Le composant intègre-t-il les effets de retour haptique/sonore (`playTapSound()`) ?
- [ ] La typographie utilise-t-elle `font-serif` pour les titres et `font-sans`/`font-mono` pour les données ?
- [ ] Les contrastes de texte respectent-ils les normes d'accessibilité sur fond sombre ?
- [ ] Le layout est-il réactif sur mobile, tablette (orientation portrait et paysage) et desktop ?
