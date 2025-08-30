import { describe, it, expect } from 'vitest';
import { formatPhoneNumber, generateGoogleMapsUrl, isMobile, isDesktop } from '../src/utilities';

describe('utilities', () => {
  it('formats phone numbers', () => {
    expect(formatPhoneNumber('2015592165')).toBe('(201) 559-2165');
    expect(formatPhoneNumber('(201) 559-2165')).toBe('(201) 559-2165');
  });
  it('generates maps url', () => {
    const url = generateGoogleMapsUrl('251-B Valley Blvd, Wood-Ridge, NJ 07075');
    expect(url).toMatch(/^https:\/\/www\.google\.com\/maps\/search\//);
  });
  it('ssr-safe device helpers', () => {
    expect(isDesktop()).toBe(true);
    expect(isMobile()).toBe(false);
  });
});

