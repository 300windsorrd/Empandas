export function formatPhoneNumber(input: string): string {
  const digits = (input || '').replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return input;
  const [, a, b, c] = digits.match(/(\d{3})(\d{3})(\d{4})/)!;
  return `(${a}) ${b}-${c}`;
}

export function generateGoogleMapsUrl(address: string): string {
  const q = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

// SSR-safe shims
const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';

export function isMobile(): boolean {
  if (!isBrowser) return false;
  const ua = navigator.userAgent || '';
  const width = window.innerWidth || 0;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua) || width < 768;
}

export function isDesktop(): boolean {
  if (!isBrowser) return true;
  return !isMobile();
}

export const Utilities = {
  formatPhoneNumber,
  generateGoogleMapsUrl,
  isMobile,
  isDesktop
};

