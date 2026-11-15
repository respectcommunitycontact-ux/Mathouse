-- =======================================================
-- MAT HOUSE - SCHÉMA SUPABASE (PostgreSQL)
-- =======================================================
-- Comment l'utiliser : Supabase > SQL Editor > New query,
-- collez TOUT ce fichier puis cliquez sur « Run ».
-- Crée la base (si elle n'existe pas). Relançable sans risque : il ne supprime rien
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

-- 9. ACCÈS — PHASE DE TEST
-- Accès ouvert pour tester facilement (tablette et admin sans connexion).
-- AVANT L'OUVERTURE AU PUBLIC : lancez supabase/securite.sql.
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to tables" ON public.tables;
CREATE POLICY "Public full access to tables" ON public.tables FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to menu_items" ON public.menu_items;
CREATE POLICY "Public full access to menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to customers" ON public.customers;
CREATE POLICY "Public full access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to orders" ON public.orders;
CREATE POLICY "Public full access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to order_items" ON public.order_items;
CREATE POLICY "Public full access to order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
