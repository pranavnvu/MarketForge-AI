// ============================================
// DevForge AI — Avatar & Image URL Helper
// ============================================

/**
 * Unwraps Google Search redirect URLs and converts GitHub profile links to direct image links.
 */
export function cleanImageUrl(input: string): string {
  if (!input) return '';
  let url = input.trim();

  // 1. Unwrap Google Search Redirect URLs (e.g. google.com/url?url=... or google.com/imgres?imgurl=...)
  if (url.includes('google.com/url') || url.includes('google.com/imgres')) {
    try {
      const parsed = new URL(url);
      const target =
        parsed.searchParams.get('url') ||
        parsed.searchParams.get('imgurl') ||
        parsed.searchParams.get('q');
      if (target) {
        url = decodeURIComponent(target);
      }
    } catch {
      // Ignore URL parse error
    }
  }

  // 2. Add https:// if missing
  if (
    url &&
    !url.startsWith('http://') &&
    !url.startsWith('https://') &&
    !url.startsWith('data:') &&
    (url.includes('/') || url.includes('.'))
  ) {
    url = 'https://' + url;
  }

  // 3. Convert GitHub profile URLs (e.g. https://github.com/pranavnvu -> https://github.com/pranavnvu.png)
  if (/^https?:\/\/github\.com\/[a-zA-Z0-9_-]+\/?$/i.test(url)) {
    url = url.replace(/\/$/, '') + '.png';
  }

  return url;
}

/**
 * Determines whether the avatar string represents a direct image URL or Data URL.
 */
export function isDirectImage(url: string): boolean {
  if (!url) return false;
  const clean = cleanImageUrl(url);
  return Boolean(
    clean &&
      (clean.startsWith('http://') ||
        clean.startsWith('https://') ||
        clean.startsWith('data:'))
  );
}
