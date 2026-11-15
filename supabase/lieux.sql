-- =======================================================
-- MAT HOUSE - PASSER À 7 TABLES + 4 CHAMBRES + 4 APPARTEMENTS
-- =======================================================
-- À lancer une fois dans Supabase > SQL Editor > New query > Run.
-- • Ajoute les chambres (101-104) et appartements (201-204)
-- • Retire les tables 8 à 16 qui n'existent pas
-- Les commandes et la carte ne sont pas touchées.
-- =======================================================

INSERT INTO public.tables (id, number, tablet_id, is_online, status) VALUES
  ('table-101', 101, 'chambre-1', false, 'libre'),
  ('table-102', 102, 'chambre-2', false, 'libre'),
  ('table-103', 103, 'chambre-3', false, 'libre'),
  ('table-104', 104, 'chambre-4', false, 'libre'),
  ('table-201', 201, 'appartement-1', false, 'libre'),
  ('table-202', 202, 'appartement-2', false, 'libre'),
  ('table-203', 203, 'appartement-3', false, 'libre'),
  ('table-204', 204, 'appartement-4', false, 'libre')
ON CONFLICT (number) DO NOTHING;

DELETE FROM public.tables WHERE number BETWEEN 8 AND 16;
