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

  // Convert full localhost/127.0.0.1 (any port) to relative URL
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    try {
      const parsed = new URL(url);
      url = parsed.pathname + parsed.search;
    } catch {
      url = url.replace(/^https?:\/\/[^\/]+/, '');
    }
  }

  return url;
}

export const resolveMediaUrl = getMediaUrl;
