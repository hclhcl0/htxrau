/**
 * Safely extracts and normalizes media URLs from Payload CMS Media objects or strings.
 * Ensures localhost/127.0.0.1 URLs are converted to relative paths (/api/media/file/...)
 * to avoid Mixed Content errors and Next.js Image SSRF restriction blocks.
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

  // Convert full localhost/127.0.0.1, obsolete domains (vercel.app, htxrau), or any host serving /api/media/file/ or /media/ to relative URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname.includes('vercel.app') ||
        parsed.hostname.includes('htxrau') ||
        parsed.pathname.startsWith('/api/media/file/') ||
        parsed.pathname.startsWith('/media/')
      ) {
        url = parsed.pathname + parsed.search;
      }
    } catch {
      url = url.replace(/^https?:\/\/[^\/]+/, '');
    }
  }

  return url;
}

export const resolveMediaUrl = getMediaUrl;
