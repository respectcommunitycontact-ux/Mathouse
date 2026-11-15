-- =======================================================
-- MAT HOUSE - SÉCURITÉ (à lancer avant l'ouverture au public)
-- =======================================================
-- Prérequis : la base a été créée avec supabase/schema.sql
-- (ou supabase/reparation.sql). Relançable sans risque.
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
