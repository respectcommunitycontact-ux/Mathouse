/**
 * Every place that can order: restaurant tables, hotel rooms and apartments.
 *
 * Each place has a number, which is what orders store (`table_number`):
 *   - Tables       1 … 7
 *   - Chambres   101 … 104
 *   - Appartements 201 … 204
 * Change the counts below if the establishment changes.
 */
export const TABLE_COUNT = 7;
export const ROOM_COUNT = 4;
export const APARTMENT_COUNT = 4;

export type PlaceKind = 'table' | 'chambre' | 'appartement';

export interface Place {
  number: number;
  kind: PlaceKind;
  /** 1, 2, 3… within its kind */
  index: number;
  /** "Table 3", "Chambre 2", "Appartement 1" */
  label: string;
  /** "Table", "Chambre", "Appart." — for small badges */
  kindLabel: string;
  /** used in the QR-code link: /commande/chambre-2 */
  slug: string;
}

const make = (kind: PlaceKind, index: number): Place => {
  const base = kind === 'table' ? 0 : kind === 'chambre' ? 100 : 200;
  const name = kind === 'table' ? 'Table' : kind === 'chambre' ? 'Chambre' : 'Appartement';
  return {
    number: base + index,
    kind,
    index,
    label: `${name} ${index}`,
    kindLabel: kind === 'appartement' ? 'Appart.' : name,
    slug: `${kind}-${index}`,
  };
};

export const TABLES: Place[] = Array.from({ length: TABLE_COUNT }, (_, i) => make('table', i + 1));
export const ROOMS: Place[] = Array.from({ length: ROOM_COUNT }, (_, i) => make('chambre', i + 1));
export const APARTMENTS: Place[] = Array.from({ length: APARTMENT_COUNT }, (_, i) => make('appartement', i + 1));
export const PLACES: Place[] = [...TABLES, ...ROOMS, ...APARTMENTS];

export const placeByNumber = (n: number): Place | undefined => PLACES.find((p) => p.number === n);
export const placeBySlug = (slug: string): Place | undefined => PLACES.find((p) => p.slug === slug.toLowerCase());

/** "Table 3", "Chambre 2", … (falls back to "Table n" for unknown numbers) */
export const placeLabel = (n: number) => placeByNumber(n)?.label ?? `Table ${n}`;

/** Rooms and apartments are served by delivery, not at a table. */
export const isDelivery = (n: number) => {
  const k = placeByNumber(n)?.kind;
  return k === 'chambre' || k === 'appartement';
};
