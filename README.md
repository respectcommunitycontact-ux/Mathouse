# RestoTablet Pro 🍽️📱
### Système Kiosque Tablette Restaurant & Console Cuisine Realtime

**RestoTablet Pro** est une application web PWA conçue spécifiquement pour fonctionner en **Mode Kiosque Verrouillé** sur des tablettes tactiles Android fixées sur chaque table de restaurant (**1 tablette = 1 table**).

---

## 🌟 Points Forts & Fonctionnalités Clés

### 1. Mode Kiosque & Sécurité Matérielle
- **Appui long 5 secondes secret** : situé en haut à gauche de l'écran pour les managers et le personnel.
- **Pavé tactile PIN sécurisé** : code PIN par défaut `1234` (modifiable).
- **Menu Settings Tablette** :
  - Affectation du numéro de table (`Table 1` à `Table 24+`), persisté dans `localStorage`.
  - Configuration du réseau WiFi restaurant.
  - Surveillance de la batterie (`navigator.getBattery()`) et de l'état en ligne.
  - Bascule en mode Plein Écran Kiosk.
- **Verrouillage Kiosk** : désactivation du clic droit / menu contextuel, du zoom intempestif et du pull-to-refresh.

### 2. Écran de Veille (Screensaver / Attract Mode)
- Déclenchement automatique après **60 secondes d'inactivité**.
- Diaporama haute définition des plats phares avec effet zoom cinématographique (Ken Burns).
- Badge lumineux *"Touchez pour commencer"* pour réveiller la tablette au contact.

### 3. Parcours Client & Prise de Commande Tactile
- **Écran 1 (Accueil)** : Animation d'accueil personnalisée avec le numéro de table (`Table 5`), et 2 grands boutons tactiles (≥ 60px) : *"Commander pour 1"* ou *"Commander à plusieurs"*.
- **Écran 2 (Nombre de personnes)** : Sélecteur ergonomique de 2 à 12 convives mémorisé pour toute la session.
- **Écran 3 (Menu Visuel Haute Définition)** :
  - Navigation par catégories (Entrées, Plats, Spécialités, Desserts, Boissons, Vins).
  - Filtres diététiques (Végétarien, Coup de Cœur, Sans Gluten...).
  - Modal de plat avec photo grand format, personnalisation de la cuisson / notes.
  - **Sélecteur "Pour qui ?"** : attribution de chaque plat à un convive précis (*Personne 1, Personne 2...*) ou *Toute la table*.
- **Panier Flottant & Tiroir Interactif** :
  - Pinned en bas d'écran avec total en temps réel.
  - Tiroir décomposant la commande **par convive** avec sous-totaux et steppers +/-.
- **Écran 4 (Validation CRM)** :
  - Formulaire rapide obligatoire : **Nom du responsable de table** + **Numéro WhatsApp** (pour le fichier CRM restaurant).
- **Écran 5 (Confirmation & Suivi)** :
  - Animation festive de confirmation avec numéro de commande unique (`CMD-001`).
  - Bouton *"Commander autre chose"* : remet le panier à zéro tout en **conservant le profil du client pendant 30 minutes**.
  - Bouton *"Demander l'addition"* et *"Appeler un serveur"*.

### 4. Console Cuisine & Admin Temps Réel (`/admin`)
- **Dashboard Kanban 3 colonnes** :
  - *Nouvelles Commandes* ➔ *En Préparation* ➔ *Prêtes à servir*.
  - **Notification sonore** par carillon audio Web Audio API à l'arrivée d'une nouvelle commande.
  - Cartes de commande visuelles avec mention géante **TABLE 5 - 4 pers**, détail par convive, et lien direct WhatsApp pour le staff.
  - Drag & Drop ou boutons 1-clic pour faire progresser les statuts.
- **Gestion du Menu (`/admin/menu`)** : bascule de disponibilité (En Stock / Rupture) en direct, édition des prix et ajout de plats.
- **État du Parc Tablettes (`/admin/tables`)** : niveau de batterie, état de connexion, alertes serveur appelé et demandes d'addition.
- **CRM WhatsApp (`/admin/customers`)** : enregistrement automatique de tous les clients sans doublon de numéro WhatsApp avec export CSV.

---

## 🛠️ Stack Technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : TailwindCSS (Thème Haute Gastronomie & boutons tactiles min 60px)
- **State Management** : Zustand
- **Temps Réel & Données** : Supabase JS SDK + Système miroir local avec `BroadcastChannel` pour un fonctionnement autonome immédiat.
- **Audio** : Web Audio API (Carillon cristallin sans fichier externe)
- **PWA** : Manifest plein écran Kiosk Android

---

## 🚀 Démarrage Rapide

```bash
# Se placer dans le dossier du projet
cd restotablet-pro

# Lancer le serveur de développement
npm run dev
```

- **Tablette Kiosque** : [http://localhost:3000](http://localhost:3000)
- **Console Cuisine** : [http://localhost:3000/admin/cuisine](http://localhost:3000/admin/cuisine)
- **Code PIN par défaut** : `1234`
