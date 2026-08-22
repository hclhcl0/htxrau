/**
 * Safely extracts and normalizes media URLs from Payload CMS Media objects or strings.
 * Ensures localhost/127.0.0.1 URLs are converted to relative paths (/api/media/file/...)
 * to avoid Next.js Image SSRF restriction blocks.
 */
export function getMediaUrl(image: any, fallback = '/placeholder-vegetable.svg'): string {
  if (!image) return fallback;

  let url = '';
  if (typeof image === 'string') {
    url = image;
  } else if (typeof image === 'object') {
    url = image.url || image.sizes?.card?.url || image.sizes?.thumbnail?.url || (image.filename ? `/api/media/file/${image.filename}` : '');
  }

  if (!url) return fallback;

  // Convert full localhost/127.0.0.1 to relative URL
  if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1') || url.startsWith('https://localhost') || url.startsWith('https://127.0.0.1')) {
    try {
      const parsed = new URL(url);
      return parsed.pathname + parsed.search;
    } catch {
      return url;
    }
  }

  return url;
}
