import { MenuCategory } from '@/types';

const img = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Order in which categories appear on the tablets and in the admin. */
export const MENU_CATEGORIES: MenuCategory[] = [
  'Viandes',
  'Poissons',
  'Volailles',
  'Fruits de mer',
  'Planches Libota',
  'Fast-food',
  'Légumes',
  'Accompagnements',
  'Gâteaux d’anniversaire',
  'Boissons sucrées',
  'Bières',
  'Jus naturels',
  'Liqueurs & vins',
];

export const CATEGORY_META: Record<
  MenuCategory | 'Toutes',
  { subtitle: string; scriptTag: string; english: string; headerImage: string }
> = {
  Toutes: {
    subtitle: 'La carte de la maison',
    scriptTag: 'Saveurs du Congo',
    english: 'Menu',
    headerImage: img('1555939594-58d7cb561ad1'),
  },
  Viandes: {
    subtitle: 'Bœuf, porc, chèvre — accompagnement au choix',
    scriptTag: 'Grillées & mijotées',
    english: 'Meat',
    headerImage: img('1529692236671-f1f6cf9683ba'),
  },
  Poissons: {
    subtitle: 'Capitaine, mabundu, makayabu… — accompagnement au choix',
    scriptTag: 'Du fleuve à l’assiette',
    english: 'Fish',
    headerImage: img('1611171711912-e3f6b536f532'),
  },
  Volailles: {
    subtitle: 'Poulet à la sauce, mayo ou grillé',
    scriptTag: 'Poulet de la maison',
    english: 'Poultry',
    headerImage: img('1598103442097-8b74394b95c6'),
  },
  'Fruits de mer': {
    subtitle: 'Crevettes — accompagnement au choix',
    scriptTag: 'Saveurs marines',
    english: 'Seafood',
    headerImage: img('1565680018434-b513d5e5fd47'),
  },
  'Planches Libota': {
    subtitle: 'Grands plateaux à partager en famille',
    scriptTag: 'Pour toute la tablée',
    english: 'Family platters',
    headerImage: img('1555939594-58d7cb561ad1'),
  },
  'Fast-food': {
    subtitle: 'Chawarma, samoussas, saucisses',
    scriptTag: 'Sur le pouce',
    english: 'Fast food',
    headerImage: img('1529006557810-274b9b2fc783'),
  },
  Légumes: {
    subtitle: 'Pondu, madesu, fumbwa, dongo-dongo…',
    scriptTag: 'Cuisine du terroir',
    english: 'Vegetables',
    headerImage: img('1626200419199-391ae4be7a41'),
  },
  Accompagnements: {
    subtitle: 'Riz, fufu, makemba, frites, kwanga',
    scriptTag: 'Au choix',
    english: 'Sides',
    headerImage: img('1516684732162-798a0062be99'),
  },
  'Gâteaux d’anniversaire': {
    subtitle: 'Sur commande, plusieurs tailles',
    scriptTag: 'Pour fêter ça',
    english: 'Birthday cakes',
    headerImage: img('1578985545062-69928b1d9587'),
  },
  'Boissons sucrées': {
    subtitle: 'Sodas et maltés bien frais',
    scriptTag: 'Rafraîchissant',
    english: 'Soft drinks',
    headerImage: img('1581636625402-29b2a704ef13'),
  },
  Bières: {
    subtitle: 'Bières locales et importées, eau minérale',
    scriptTag: 'Bien fraîches',
    english: 'Beers',
    headerImage: img('1608270586620-248524c67de9'),
  },
  'Jus naturels': {
    subtitle: 'Gingembre, bissap, ananas',
    scriptTag: 'Pressés maison',
    english: 'Fresh juices',
    headerImage: img('1600271886742-f049cd451bba'),
  },
  'Liqueurs & vins': {
    subtitle: 'Liqueurs, whisky et porto',
    scriptTag: 'Pour finir en douceur',
    english: 'Spirits & wine',
    headerImage: img('1569529465841-dfecdab7503b'),
  },
};
