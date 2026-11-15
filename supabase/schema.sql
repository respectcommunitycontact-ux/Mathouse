-- =======================================================
-- MAT HOUSE - SCHÉMA SUPABASE (PostgreSQL)
-- =======================================================
-- Comment l'utiliser : Supabase > SQL Editor > New query,
-- collez TOUT ce fichier puis cliquez sur « Run ».
-- Le script peut être relancé sans risque : il ne supprime rien
-- et ne remplace pas les plats déjà modifiés depuis l'admin.
--
-- Les identifiants sont du texte (ex. « m-001 », « ord-1700000000 »)
-- car ce sont ceux que l'application génère.
-- =======================================================

-- 1. LIEUX QUI COMMANDENT : tables (1-7), chambres (101-104), appartements (201-204)
CREATE TABLE IF NOT EXISTS public.tables (
    id TEXT PRIMARY KEY,
    number INTEGER NOT NULL UNIQUE,
    tablet_id TEXT,
    is_online BOOLEAN DEFAULT true,
    battery_level INTEGER DEFAULT 100,
    is_charging BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'libre' CHECK (status IN ('libre', 'occupee', 'addition_demandee', 'serveur_appele')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CARTE (plats et boissons). Prix en francs congolais, sauf currency = 'USD'
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CDF' CHECK (currency IN ('CDF', 'USD')),
    category TEXT NOT NULL CHECK (category IN ('Viandes', 'Poissons', 'Volailles', 'Fruits de mer', 'Planches Libota', 'Fast-food', 'Légumes', 'Accompagnements', 'Gâteaux d’anniversaire', 'Boissons sucrées', 'Bières', 'Jus naturels', 'Liqueurs & vins')),
    image_url TEXT NOT NULL DEFAULT '',
    is_available BOOLEAN NOT NULL DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    preparation_time_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLIENTS (contacts WhatsApp enregistrés à la commande)
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL UNIQUE,
    notes TEXT,
    total_orders INTEGER DEFAULT 1,
    last_visit TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMMANDES
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    table_number INTEGER NOT NULL,
    people_count INTEGER NOT NULL DEFAULT 1,
    customer_id TEXT REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL,
    total NUMERIC(14, 2) NOT NULL DEFAULT 0,      -- en francs congolais
    total_usd NUMERIC(10, 2),                     -- articles payés en dollars
    status TEXT NOT NULL DEFAULT 'nouvelle' CHECK (status IN ('nouvelle', 'preparation', 'prete', 'servie', 'annulee')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DÉTAIL DES COMMANDES (un plat par ligne, par convive)
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id TEXT,
    item_name TEXT NOT NULL,
    item_price NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CDF' CHECK (currency IN ('CDF', 'USD')),
    quantity INTEGER NOT NULL DEFAULT 1,
    person_label TEXT NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);

-- 6. DONNÉES DE DÉPART : 7 tables (1-7), 4 chambres (101-104), 4 appartements (201-204)
INSERT INTO public.tables (id, number, tablet_id) VALUES
  ('table-1', 1, 'table-1'),
  ('table-2', 2, 'table-2'),
  ('table-3', 3, 'table-3'),
  ('table-4', 4, 'table-4'),
  ('table-5', 5, 'table-5'),
  ('table-6', 6, 'table-6'),
  ('table-7', 7, 'table-7'),
  ('table-101', 101, 'chambre-1'),
  ('table-102', 102, 'chambre-2'),
  ('table-103', 103, 'chambre-3'),
  ('table-104', 104, 'chambre-4'),
  ('table-201', 201, 'appartement-1'),
  ('table-202', 202, 'appartement-2'),
  ('table-203', 203, 'appartement-3'),
  ('table-204', 204, 'appartement-4')
ON CONFLICT (number) DO NOTHING;

-- 7. DONNÉES DE DÉPART : la carte (68 articles)
INSERT INTO public.menu_items (id, name, description, price, currency, category, image_url, is_available, tags) VALUES
  ('m-001', 'Viande de bœuf', 'Bœuf mijoté maison. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 30000, 'CDF', 'Viandes', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-002', 'Viande de porc', 'Porc tendre préparé à la congolaise. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 30000, 'CDF', 'Viandes', 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-003', 'Viande de chèvre', 'Chèvre mijotée et bien relevée. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 30000, 'CDF', 'Viandes', 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-004', 'Pattes de porc (makoso)', 'Pattes de porc fondantes en sauce. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 18000, 'CDF', 'Viandes', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-005', 'Abats de chèvre (taba)', 'Les « affaires intérieures » de taba, cuisinées en sauce. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 20000, 'CDF', 'Viandes', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-006', 'Poisson capitaine', 'Capitaine entier. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 30000, 'CDF', 'Poissons', 'https://images.unsplash.com/photo-1611171711912-e3f6b536f532?auto=format&fit=crop&w=1200&q=80', true, ARRAY['Signature']::TEXT[]),
  ('m-007', 'Poisson rouge (mabundu)', 'Mabundu préparé à votre goût. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 30000, 'CDF', 'Poissons', 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-008', 'Poisson Thomson', 'Chinchard (Thomson). Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 15000, 'CDF', 'Poissons', 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-009', 'Makayabu', 'Morue salée à la congolaise. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 30000, 'CDF', 'Poissons', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-010', 'Poisson sole', 'Sole préparée maison. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 30000, 'CDF', 'Poissons', 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-011', 'Poisson malua', 'Malua cuisiné à la maison. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 30000, 'CDF', 'Poissons', 'https://images.unsplash.com/photo-1611171711912-e3f6b536f532?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-012', 'Poisson fumé à la sauce', 'Poisson fumé mijoté dans sa sauce. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 25000, 'CDF', 'Poissons', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-013', 'Poulet à la sauce', 'Poulet entier mijoté en sauce. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 30000, 'CDF', 'Volailles', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-014', 'Demi-poulet à la sauce', 'Demi-poulet mijoté en sauce. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 20000, 'CDF', 'Volailles', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-015', 'Poulet mayo', 'Poulet entier rôti, sauce mayonnaise. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 45000, 'CDF', 'Volailles', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=1200&q=80', true, ARRAY['Signature']::TEXT[]),
  ('m-016', 'Demi-poulet mayo', 'Demi-poulet rôti, sauce mayonnaise. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 25000, 'CDF', 'Volailles', 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-017', 'Cuisse de poulet grillée', 'Cuisse de poulet grillée au feu. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 15000, 'CDF', 'Volailles', 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-018', 'Crevettes', 'Crevettes sautées. Servi avec l’accompagnement de votre choix : riz, fufu, makemba, frites ou kwanga.', 40000, 'CDF', 'Fruits de mer', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-019', 'Planche Libota simple (6-7 pers.)', 'Grand plateau familial à partager, pour 6 à 7 personnes.', 150000, 'CDF', 'Planches Libota', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-020', 'Planche Libota composée (8-10 pers.)', 'Plateau familial composé ou spécialisé, pour 8 à 10 personnes.', 180000, 'CDF', 'Planches Libota', 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80', true, ARRAY['Signature']::TEXT[]),
  ('m-021', 'Chawarma poulet', 'Galette garnie de poulet grillé et crudités.', 10000, 'CDF', 'Fast-food', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-022', 'Chawarma viande', 'Galette garnie de viande grillée et crudités.', 12000, 'CDF', 'Fast-food', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-023', 'Samoussas à la viande (5 pièces)', '5 samoussas croustillants farcis à la viande.', 12000, 'CDF', 'Fast-food', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-024', 'Samoussas au poulet (5 pièces)', '5 samoussas croustillants farcis au poulet.', 10000, 'CDF', 'Fast-food', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-025', 'Saucisse fraîche', 'Saucisse fraîche, accompagnement au choix et salade de légumes.', 20000, 'CDF', 'Fast-food', 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-026', 'Saucisse de Goma', 'Saucisse de Goma, accompagnement au choix et salade de légumes.', 10, 'USD', 'Fast-food', 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-027', 'Pondu', 'Feuilles de manioc pilées et mijotées.', 5000, 'CDF', 'Légumes', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-028', 'Pondu madesu', 'Pondu servi avec des haricots (madesu).', 7000, 'CDF', 'Légumes', 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-029', 'Madesu', 'Haricots mijotés à la congolaise.', 5000, 'CDF', 'Légumes', 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-030', 'Fumbwa', 'Feuilles de fumbwa à la pâte d’arachide.', 5000, 'CDF', 'Légumes', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-031', 'Légumes verts', 'Légumes verts de saison.', 5000, 'CDF', 'Légumes', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-032', 'Dongo-dongo (gombo) au poisson fumé', 'Gombo mijoté avec du poisson fumé.', 10000, 'CDF', 'Légumes', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-033', '3 pièces (mayebo, mbizo, poisson fumé)', 'Assortiment : mayebo, mbizo et poisson fumé.', 10000, 'CDF', 'Légumes', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-034', 'Riz', 'Portion de riz blanc.', 5000, 'CDF', 'Accompagnements', 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-035', 'Fufu', 'Pâte de manioc ou de maïs.', 3000, 'CDF', 'Accompagnements', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-036', 'Makemba', 'Bananes plantains.', 5000, 'CDF', 'Accompagnements', 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-037', 'Frites', 'Portion de frites.', 5000, 'CDF', 'Accompagnements', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-038', 'Kwanga', 'Chikwangue (pain de manioc).', 3000, 'CDF', 'Accompagnements', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-039', 'Gâteau d’anniversaire — petit', 'Gâteau d’anniversaire, petite taille. À commander à l’avance.', 35000, 'CDF', 'Gâteaux d’anniversaire', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-040', 'Gâteau d’anniversaire — moyen', 'Gâteau d’anniversaire, taille moyenne. À commander à l’avance.', 45000, 'CDF', 'Gâteaux d’anniversaire', 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-041', 'Gâteau d’anniversaire — grand', 'Gâteau d’anniversaire, grande taille. Autres tailles sur demande.', 55000, 'CDF', 'Gâteaux d’anniversaire', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-042', 'Maltina (petit)', 'Boisson maltée sans alcool.', 3000, 'CDF', 'Boissons sucrées', 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-043', 'Maltina (grand)', 'Boisson maltée sans alcool, grand format.', 5000, 'CDF', 'Boissons sucrées', 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-044', 'Sprite', 'Soda citron.', 3000, 'CDF', 'Boissons sucrées', 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-045', 'Coca-Cola', 'Soda cola.', 3000, 'CDF', 'Boissons sucrées', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-046', 'Fanta', 'Soda à l’orange.', 3000, 'CDF', 'Boissons sucrées', 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-047', 'Vitalo (petit)', 'Boisson gazeuse sucrée.', 3000, 'CDF', 'Boissons sucrées', 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-048', 'Energy Malt', 'Boisson maltée énergisante.', 3000, 'CDF', 'Boissons sucrées', 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-049', 'XXL', 'Boisson énergisante.', 3000, 'CDF', 'Boissons sucrées', 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-050', 'Heineken', 'Bière bien fraîche.', 5000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-051', 'Légende', 'Bière bien fraîche.', 5000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-052', 'Castel', 'Bière bien fraîche.', 5000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-053', 'Beaufort', 'Bière bien fraîche.', 5000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-054', 'Kooyi', 'Bière bien fraîche.', 5000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-055', 'Turbo King', 'Bière bien fraîche.', 5000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-056', '33 Export', 'Bière bien fraîche.', 7000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-057', 'Tembo', 'Bière bien fraîche.', 7000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-058', 'Bavaria', 'Bien frais.', 8000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-059', 'Savanna', 'Bien frais.', 8000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-060', 'Panaché', 'Bien frais.', 8000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-061', 'Leffe', 'Bière d’abbaye belge.', 10000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-062', 'Eau minérale', 'Bouteille d’eau minérale.', 1000, 'CDF', 'Bières', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-063', 'Jus de gingembre (tangawisi)', 'Jus de gingembre frais, maison.', 6000, 'CDF', 'Jus naturels', 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-064', 'Jus de bissap', 'Infusion d’hibiscus fraîche, maison.', 6000, 'CDF', 'Jus naturels', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-065', 'Jus d’ananas', 'Ananas pressé, maison.', 6000, 'CDF', 'Jus naturels', 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-066', 'Amarula', 'Liqueur crémeuse au fruit de marula.', 10000, 'CDF', 'Liqueurs & vins', 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-067', 'J&B', 'Whisky écossais.', 10000, 'CDF', 'Liqueurs & vins', 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[]),
  ('m-068', 'Vin de Porto', 'Bouteille de porto.', 25, 'USD', 'Liqueurs & vins', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', true, '{}'::TEXT[])
ON CONFLICT (id) DO NOTHING;

-- 8. TEMPS RÉEL (la cuisine et l'admin reçoivent les changements en direct)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =======================================================
-- 9. SÉCURITÉ
-- =======================================================
-- • La tablette (non connectée, rôle « anon ») peut seulement :
--     lire la carte et les tables, passer une commande, changer l'état
--     de SA table (appel serveur, addition…) et envoyer sa batterie.
--   Elle ne peut PAS lire les clients ni les commandes, ni modifier la carte.
-- • Le personnel se connecte (email + mot de passe) et doit figurer dans
--   la table « staff » pour tout voir et tout gérer.
-- =======================================================

-- 9.1 Liste du personnel autorisé (ajoutez les emails ici ou dans Table Editor)
CREATE TABLE IF NOT EXISTS public.staff (
    email TEXT PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.staff
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$fn$;

-- 9.2 Numéro de commande (CMD-001, CMD-002…) attribué par la base
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

-- 9.3 Passer une commande depuis la tablette.
-- Les prix et noms sont repris de la carte : une tablette ne peut pas inventer un prix.
CREATE OR REPLACE FUNCTION public.place_order(p JSONB)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_order_id TEXT := p ->> 'id';
  v_table INT := (p ->> 'table_number')::INT;
  v_wa TEXT := regexp_replace(coalesce(p -> 'customer' ->> 'whatsapp', ''), '[^0-9+]', '', 'g');
  v_name TEXT := left(trim(coalesce(p -> 'customer' ->> 'full_name', '')), 120);
  v_cust_id TEXT;
  v_num TEXT;
  v_total NUMERIC := 0;
  v_total_usd NUMERIC := 0;
  v_count INT;
BEGIN
  IF v_order_id IS NULL OR v_order_id !~ '^ord-[0-9a-z-]+$' THEN
    RAISE EXCEPTION 'Identifiant de commande invalide';
  END IF;
  IF v_table IS NULL OR NOT EXISTS (SELECT 1 FROM public.tables WHERE number = v_table) THEN
    RAISE EXCEPTION 'Table inconnue';
  END IF;

  -- Lignes de la commande, au prix de la carte
  CREATE TEMP TABLE _lines ON COMMIT DROP AS
  SELECT
    left(it ->> 'id', 80) AS id,
    m.id AS menu_item_id,
    m.name AS item_name,
    m.price AS item_price,
    m.currency AS currency,
    greatest(1, least(50, coalesce((it ->> 'quantity')::INT, 1))) AS quantity,
    left(coalesce(nullif(it ->> 'person_label', ''), 'Toute la table'), 60) AS person_label,
    left(nullif(it ->> 'special_instructions', ''), 300) AS special_instructions
  FROM jsonb_array_elements(coalesce(p -> 'items', '[]'::JSONB)) AS it
  JOIN public.menu_items m ON m.id = it ->> 'menu_item_id' AND m.is_available;

  SELECT count(*) INTO v_count FROM _lines;
  IF v_count = 0 THEN
    RAISE EXCEPTION 'Commande vide ou plats indisponibles';
  END IF;

  SELECT coalesce(sum(item_price * quantity) FILTER (WHERE currency = 'CDF'), 0),
         coalesce(sum(item_price * quantity) FILTER (WHERE currency = 'USD'), 0)
    INTO v_total, v_total_usd
  FROM _lines;

  -- Client (retrouvé par son numéro WhatsApp)
  IF length(v_wa) >= 8 THEN
    INSERT INTO public.customers (id, full_name, whatsapp, total_orders, last_visit)
    VALUES ('cust-' || substr(md5(v_wa), 1, 12), coalesce(nullif(v_name, ''), 'Client'), v_wa, 1, NOW())
    ON CONFLICT (whatsapp) DO UPDATE
      SET full_name = coalesce(nullif(EXCLUDED.full_name, 'Client'), public.customers.full_name),
          total_orders = public.customers.total_orders + 1,
          last_visit = NOW()
    RETURNING id INTO v_cust_id;
  END IF;

  v_num := 'CMD-' || lpad(nextval('public.order_number_seq')::TEXT, 3, '0');

  INSERT INTO public.orders (id, order_number, table_number, people_count, customer_id, total, total_usd, status, notes)
  VALUES (
    v_order_id, v_num, v_table,
    greatest(1, least(30, coalesce((p ->> 'people_count')::INT, 1))),
    v_cust_id, v_total, nullif(v_total_usd, 0), 'nouvelle',
    left(nullif(p ->> 'notes', ''), 500)
  );

  INSERT INTO public.order_items (id, order_id, menu_item_id, item_name, item_price, currency, quantity, person_label, special_instructions)
  SELECT coalesce(id, v_order_id || '-' || row_number() OVER ()), v_order_id, menu_item_id, item_name, item_price, currency, quantity, person_label, special_instructions
  FROM _lines;

  UPDATE public.tables SET status = 'occupee', updated_at = NOW()
  WHERE number = v_table AND status = 'libre';

  RETURN jsonb_build_object(
    'id', v_order_id, 'order_number', v_num, 'customer_id', v_cust_id,
    'total', v_total, 'total_usd', nullif(v_total_usd, 0)
  );
END;
$fn$;

-- 9.4 Changer l'état d'une table (appel serveur, addition, occupée, libre)
CREATE OR REPLACE FUNCTION public.set_table_status(p_number INT, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF p_status NOT IN ('libre', 'occupee', 'addition_demandee', 'serveur_appele') THEN
    RAISE EXCEPTION 'État de table invalide';
  END IF;
  UPDATE public.tables SET status = p_status, updated_at = NOW() WHERE number = p_number;
END;
$fn$;

-- 9.5 La tablette signale qu'elle est allumée (et sa batterie)
CREATE OR REPLACE FUNCTION public.tablet_heartbeat(p_number INT, p_battery INT DEFAULT NULL, p_charging BOOLEAN DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  UPDATE public.tables
  SET is_online = true,
      battery_level = coalesce(greatest(0, least(100, p_battery)), battery_level),
      is_charging = coalesce(p_charging, is_charging),
      updated_at = NOW()
  WHERE number = p_number;
END;
$fn$;

REVOKE ALL ON FUNCTION public.place_order(JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_table_status(INT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tablet_heartbeat(INT, INT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_table_status(INT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tablet_heartbeat(INT, INT, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated;

-- 9.6 Règles d'accès (Row Level Security)
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to tables" ON public.tables;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to menu_items" ON public.menu_items;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to customers" ON public.customers;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to orders" ON public.orders;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to order_items" ON public.order_items;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to staff" ON public.staff;

-- Carte et tables : lisibles par tous (tablettes), modifiables par le personnel
DROP POLICY IF EXISTS "Lecture publique carte" ON public.menu_items;
CREATE POLICY "Lecture publique carte" ON public.menu_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Personnel gere la carte" ON public.menu_items;
CREATE POLICY "Personnel gere la carte" ON public.menu_items FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Lecture publique tables" ON public.tables;
CREATE POLICY "Lecture publique tables" ON public.tables FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Personnel gere les tables" ON public.tables;
CREATE POLICY "Personnel gere les tables" ON public.tables FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Clients et commandes : réservés au personnel
DROP POLICY IF EXISTS "Personnel seulement customers" ON public.customers;
CREATE POLICY "Personnel seulement customers" ON public.customers FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "Personnel seulement orders" ON public.orders;
CREATE POLICY "Personnel seulement orders" ON public.orders FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "Personnel seulement order_items" ON public.order_items;
CREATE POLICY "Personnel seulement order_items" ON public.order_items FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Liste du personnel : chacun peut seulement vérifier sa propre ligne
DROP POLICY IF EXISTS "Voir sa propre fiche staff" ON public.staff;
CREATE POLICY "Voir sa propre fiche staff" ON public.staff FOR SELECT TO authenticated
  USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- =======================================================
-- 10. AJOUTER UN MEMBRE DU PERSONNEL
-- 1) Supabase > Authentication > Users > Add user (cochez « Auto Confirm »)
-- 2) Puis exécutez (en remplaçant l'email) :
--    INSERT INTO public.staff (email, name) VALUES ('prenom@exemple.com', 'Prénom') ON CONFLICT DO NOTHING;
-- =======================================================
