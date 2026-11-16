import { MenuItem, TableRecord, Customer, Order } from '@/types';
import { PLACES } from './places';

/**
 * La vraie carte de Mat House.
 * Prix en francs congolais (FC), sauf les articles marqués currency: 'USD' (en dollars).
 */
export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: "m-001",
    name: "Viande de bœuf",
    description: "Bœuf mijoté maison. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 30000,
    category: "Viandes",
    image_url: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-002",
    name: "Viande de porc",
    description: "Porc tendre préparé à la congolaise. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 30000,
    category: "Viandes",
    image_url: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-003",
    name: "Viande de chèvre",
    description: "Chèvre mijotée et bien relevée. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 30000,
    category: "Viandes",
    image_url: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-004",
    name: "Pattes de porc (makoso)",
    description: "Pattes de porc fondantes en sauce. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 18000,
    category: "Viandes",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-005",
    name: "Abats de chèvre (taba)",
    description: "Les « affaires intérieures » de taba, cuisinées en sauce. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 20000,
    category: "Viandes",
    image_url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-006",
    name: "Poisson capitaine",
    description: "Capitaine entier. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 30000,
    category: "Poissons",
    image_url: "https://images.unsplash.com/photo-1611171711912-e3f6b536f532?auto=format&fit=crop&w=1200&q=80",
    is_available: true,
    tags: [
      "Signature"
    ]
  },
  {
    id: "m-007",
    name: "Poisson rouge (mabundu)",
    description: "Mabundu préparé à votre goût. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 30000,
    category: "Poissons",
    image_url: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-008",
    name: "Poisson Thomson",
    description: "Chinchard (Thomson). Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 15000,
    category: "Poissons",
    image_url: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-009",
    name: "Makayabu",
    description: "Morue salée à la congolaise. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 30000,
    category: "Poissons",
    image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-010",
    name: "Poisson sole",
    description: "Sole préparée maison. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 30000,
    category: "Poissons",
    image_url: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-011",
    name: "Poisson malua",
    description: "Malua cuisiné à la maison. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 30000,
    category: "Poissons",
    image_url: "https://images.unsplash.com/photo-1611171711912-e3f6b536f532?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-012",
    name: "Poisson fumé à la sauce",
    description: "Poisson fumé mijoté dans sa sauce. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 25000,
    category: "Poissons",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-013",
    name: "Poulet à la sauce",
    description: "Poulet entier mijoté en sauce. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 30000,
    category: "Volailles",
    image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-014",
    name: "Demi-poulet à la sauce",
    description: "Demi-poulet mijoté en sauce. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 20000,
    category: "Volailles",
    image_url: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-015",
    name: "Poulet mayo",
    description: "Poulet entier rôti, sauce mayonnaise. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 45000,
    category: "Volailles",
    image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=1200&q=80",
    is_available: true,
    tags: [
      "Signature"
    ]
  },
  {
    id: "m-016",
    name: "Demi-poulet mayo",
    description: "Demi-poulet rôti, sauce mayonnaise. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 25000,
    category: "Volailles",
    image_url: "https://images.unsplash.com/photo-1594221708779-94832f4320d1?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-017",
    name: "Cuisse de poulet grillée",
    description: "Cuisse de poulet grillée au feu. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 15000,
    category: "Volailles",
    image_url: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-018",
    name: "Crevettes",
    description: "Crevettes sautées. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.",
    price: 40000,
    category: "Fruits de mer",
    image_url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-019",
    name: "Planche Libota simple (6-7 pers.)",
    description: "Grand plateau familial à partager, pour 6 à 7 personnes.",
    price: 150000,
    category: "Planches Libota",
    image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-020",
    name: "Planche Libota composée (8-10 pers.)",
    description: "Plateau familial composé ou spécialisé, pour 8 à 10 personnes.",
    price: 180000,
    category: "Planches Libota",
    image_url: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80",
    is_available: true,
    tags: [
      "Signature"
    ]
  },
  {
    id: "m-021",
    name: "Chawarma poulet",
    description: "Galette garnie de poulet grillé et crudités.",
    price: 10000,
    category: "Fast-food",
    image_url: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-022",
    name: "Chawarma viande",
    description: "Galette garnie de viande grillée et crudités.",
    price: 12000,
    category: "Fast-food",
    image_url: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-023",
    name: "Samoussas à la viande (5 pièces)",
    description: "5 samoussas croustillants farcis à la viande.",
    price: 12000,
    category: "Fast-food",
    image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-024",
    name: "Samoussas au poulet (5 pièces)",
    description: "5 samoussas croustillants farcis au poulet.",
    price: 10000,
    category: "Fast-food",
    image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-025",
    name: "Saucisse fraîche",
    description: "Saucisse fraîche, accompagnement au choix et salade de légumes.",
    price: 20000,
    category: "Fast-food",
    image_url: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-026",
    name: "Saucisse de Goma",
    description: "Saucisse de Goma, accompagnement au choix et salade de légumes.",
    price: 10,
    currency: "USD",
    category: "Fast-food",
    image_url: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-027",
    name: "Pondu",
    description: "Feuilles de manioc pilées et mijotées.",
    price: 5000,
    category: "Légumes",
    image_url: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-028",
    name: "Pondu madesu",
    description: "Pondu servi avec des haricots (madesu).",
    price: 7000,
    category: "Légumes",
    image_url: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-029",
    name: "Madesu",
    description: "Haricots mijotés à la congolaise.",
    price: 5000,
    category: "Légumes",
    image_url: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-030",
    name: "Fumbwa",
    description: "Feuilles de fumbwa à la pâte d’arachide.",
    price: 5000,
    category: "Légumes",
    image_url: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-031",
    name: "Légumes verts",
    description: "Légumes verts de saison.",
    price: 5000,
    category: "Légumes",
    image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-032",
    name: "Dongo-dongo (gombo) au poisson fumé",
    description: "Gombo mijoté avec du poisson fumé.",
    price: 10000,
    category: "Légumes",
    image_url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-033",
    name: "3 pièces (mayebo, mbizo, poisson fumé)",
    description: "Assortiment : mayebo, mbizo et poisson fumé.",
    price: 10000,
    category: "Légumes",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-034",
    name: "Riz",
    description: "Portion de riz blanc.",
    price: 5000,
    category: "Accompagnements",
    image_url: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-035",
    name: "Fufu",
    description: "Pâte de manioc ou de maïs.",
    price: 3000,
    category: "Accompagnements",
    image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-036",
    name: "Makemba",
    description: "Bananes plantains.",
    price: 5000,
    category: "Accompagnements",
    image_url: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-037",
    name: "Frites",
    description: "Portion de frites.",
    price: 5000,
    category: "Accompagnements",
    image_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-038",
    name: "Kwanga",
    description: "Chikwangue (pain de manioc).",
    price: 3000,
    category: "Accompagnements",
    image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-039",
    name: "Gâteau d’anniversaire — petit",
    description: "Gâteau d’anniversaire, petite taille. À commander à l’avance.",
    price: 35000,
    category: "Gâteaux d’anniversaire",
    image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-040",
    name: "Gâteau d’anniversaire — moyen",
    description: "Gâteau d’anniversaire, taille moyenne. À commander à l’avance.",
    price: 45000,
    category: "Gâteaux d’anniversaire",
    image_url: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-041",
    name: "Gâteau d’anniversaire — grand",
    description: "Gâteau d’anniversaire, grande taille. Autres tailles sur demande.",
    price: 55000,
    category: "Gâteaux d’anniversaire",
    image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-042",
    name: "Maltina (petit)",
    description: "Boisson maltée sans alcool.",
    price: 3000,
    category: "Boissons sucrées",
    image_url: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-043",
    name: "Maltina (grand)",
    description: "Boisson maltée sans alcool, grand format.",
    price: 5000,
    category: "Boissons sucrées",
    image_url: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-044",
    name: "Sprite",
    description: "Soda citron.",
    price: 3000,
    category: "Boissons sucrées",
    image_url: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-045",
    name: "Coca-Cola",
    description: "Soda cola.",
    price: 3000,
    category: "Boissons sucrées",
    image_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-046",
    name: "Fanta",
    description: "Soda à l’orange.",
    price: 3000,
    category: "Boissons sucrées",
    image_url: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-047",
    name: "Vitalo (petit)",
    description: "Boisson gazeuse sucrée.",
    price: 3000,
    category: "Boissons sucrées",
    image_url: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-048",
    name: "Energy Malt",
    description: "Boisson maltée énergisante.",
    price: 3000,
    category: "Boissons sucrées",
    image_url: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-049",
    name: "XXL",
    description: "Boisson énergisante.",
    price: 3000,
    category: "Boissons sucrées",
    image_url: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-050",
    name: "Heineken",
    description: "Bière bien fraîche.",
    price: 5000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-051",
    name: "Légende",
    description: "Bière bien fraîche.",
    price: 5000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-052",
    name: "Castel",
    description: "Bière bien fraîche.",
    price: 5000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-053",
    name: "Beaufort",
    description: "Bière bien fraîche.",
    price: 5000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-054",
    name: "Kooyi",
    description: "Bière bien fraîche.",
    price: 5000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-055",
    name: "Turbo King",
    description: "Bière bien fraîche.",
    price: 5000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-056",
    name: "33 Export",
    description: "Bière bien fraîche.",
    price: 7000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-057",
    name: "Tembo",
    description: "Bière bien fraîche.",
    price: 7000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-058",
    name: "Bavaria",
    description: "Bien frais.",
    price: 8000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-059",
    name: "Savanna",
    description: "Bien frais.",
    price: 8000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-060",
    name: "Panaché",
    description: "Bien frais.",
    price: 8000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-061",
    name: "Leffe",
    description: "Bière d’abbaye belge.",
    price: 10000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-062",
    name: "Eau minérale",
    description: "Bouteille d’eau minérale.",
    price: 1000,
    category: "Bières",
    image_url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-063",
    name: "Jus de gingembre (tangawisi)",
    description: "Jus de gingembre frais, maison.",
    price: 6000,
    category: "Jus naturels",
    image_url: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-064",
    name: "Jus de bissap",
    description: "Infusion d’hibiscus fraîche, maison.",
    price: 6000,
    category: "Jus naturels",
    image_url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-065",
    name: "Jus d’ananas",
    description: "Ananas pressé, maison.",
    price: 6000,
    category: "Jus naturels",
    image_url: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-066",
    name: "Amarula",
    description: "Liqueur crémeuse au fruit de marula.",
    price: 10000,
    category: "Liqueurs & vins",
    image_url: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-067",
    name: "J&B",
    description: "Whisky écossais.",
    price: 10000,
    category: "Liqueurs & vins",
    image_url: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  },
  {
    id: "m-068",
    name: "Vin de Porto",
    description: "Bouteille de porto.",
    price: 25,
    currency: "USD",
    category: "Liqueurs & vins",
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
    is_available: true
  }
];

export const SCREENSAVER_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=1600&q=65",
    title: "Poulet mayo",
    subtitle: "Le grand classique de la maison",
  },
  {
    url: "https://images.unsplash.com/photo-1611171711912-e3f6b536f532?auto=format&fit=crop&w=1600&q=65",
    title: "Poisson capitaine",
    subtitle: "Servi avec l’accompagnement de votre choix",
  },
  {
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=65",
    title: "Planches Libota",
    subtitle: "À partager en famille, de 6 à 10 personnes",
  },
  {
    url: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=1600&q=65",
    title: "Pondu & légumes du pays",
    subtitle: "La cuisine congolaise comme à la maison",
  },
];

/** Tables, chambres et appartements (voir lib/places.ts), tous libres au départ. */
export const INITIAL_TABLES: TableRecord[] = PLACES.map((p) => ({
  id: `table-${p.number}`,
  number: p.number,
  tablet_id: p.slug,
  is_online: false,
  battery_level: 100,
  status: 'libre',
  updated_at: new Date().toISOString(),
}));

/** Aucun client fictif : la liste se remplit avec les vraies commandes. */
export const INITIAL_CUSTOMERS: Customer[] = [];

/** Aucune commande fictive. */
export const INITIAL_ORDERS: Order[] = [];
