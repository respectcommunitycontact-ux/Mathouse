-- =======================================================
-- MAT HOUSE - EFFACER LES DONNÉES DE TEST
-- =======================================================
-- ATTENTION : suppression DÉFINITIVE, impossible à annuler.
-- Efface : toutes les commandes, leur détail et tous les clients.
-- Remet : toutes les tables à « libre » et la numérotation à CMD-001.
-- Ne touche PAS : la carte (plats, prix, photos) ni la liste du personnel.
--
-- À lancer dans Supabase > SQL Editor > New query > Run,
-- par exemple juste avant l'ouverture au public.
-- =======================================================

BEGIN;

DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.customers;

UPDATE public.tables
SET status = 'libre',
    is_online = false,
    battery_level = 100,
    is_charging = false,
    updated_at = NOW();

-- Repartir de CMD-001 (si le script de sécurité a déjà été lancé)
DO $$ BEGIN
  ALTER SEQUENCE public.order_number_seq RESTART WITH 1;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

COMMIT;
