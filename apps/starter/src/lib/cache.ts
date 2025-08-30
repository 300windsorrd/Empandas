import { revalidateTag as base } from 'next/cache';

export function revalidateMenu() {
  base('menu');
}

export function revalidateHero() {
  base('hero');
}

export function revalidateSettings() {
  base('settings');
}

