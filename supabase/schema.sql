-- =======================================================
-- RESTOTABLET PRO - DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- =======================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES (Tablettes & Tables du restaurant)
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL UNIQUE,
    tablet_id TEXT,
    is_online BOOLEAN DEFAULT true,
    battery_level INTEGER DEFAULT 100,
    status TEXT DEFAULT 'libre' CHECK (status IN ('libre', 'occupee', 'addition_demandee', 'serveur_appele')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MENU ITEMS (Plats, Entrées, Boissons, etc.)
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Entrées', 'Plats', 'Spécialités', 'Desserts', 'Boissons', 'Vins')),
    image_url TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    preparation_time_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CUSTOMERS (CRM Responsables de table)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL UNIQUE,
    notes TEXT,
    total_orders INTEGER DEFAULT 1,
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ORDERS (Commandes envoyées en cuisine)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL, -- Ex: CMD-001
    table_number INTEGER NOT NULL,
    people_count INTEGER NOT NULL DEFAULT 1,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'nouvelle' CHECK (status IN ('nouvelle', 'preparation', 'prete', 'servie', 'annulee')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ORDER ITEMS (Détail de chaque plat par convive)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    item_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    person_label TEXT NOT NULL, -- Ex: "Personne 1", "Personne 2", etc.
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ENABLE REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Anonymous public read & write policies for restaurant kiosk operation
CREATE POLICY "Public full access to tables" ON public.tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
