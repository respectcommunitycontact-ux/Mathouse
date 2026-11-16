/**
 * Ask the image host for a picture at the size it is displayed.
 * Unsplash resizes on its servers: a 58 px thumbnail no longer downloads a 1200 px photo.
 * Other images (uploaded photos, other hosts) are returned unchanged.
 */
export const sizedImage = (url: string | undefined | null, width: number, quality = 70): string => {
  if (!url) return '';
  if (!url.includes('images.unsplash.com')) return url;
  try {
    const u = new URL(url);
    // Retina screens show 2 physical pixels per CSS pixel
    u.searchParams.set('w', String(Math.round(width * 2)));
    u.searchParams.set('q', String(quality));
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    return u.toString();
  } catch {
    return url;
  }
};
