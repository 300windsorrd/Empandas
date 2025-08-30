#!/usr/bin/env -S node --enable-source-maps
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['packages', 'apps'];
const ALLOWED_ACCENT = '--color-accent';
const RAW_HEX = '#02FCFD';

const TEXT_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.mdx']);

function* walk(dir: string): any {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (TEXT_EXTS.has(extname(name))) yield p;
  }
}

const violations: string[] = [];

for (const base of TARGET_DIRS) {
  const root = join(ROOT, base);
  try {
    statSync(root);
  } catch {
    continue;
  }
  for (const file of walk(root)) {
    const text = readFileSync(file, 'utf8');
    // Raw hex usage anywhere is forbidden
    if (text.includes(RAW_HEX)) {
      violations.push(`${file}: raw ${RAW_HEX} usage`);
    }
    // Using accent token for backgrounds/buttons is forbidden
    const badClassRe = /(bg|btn)[-:=[\(\s]*[^\n]*(--color-accent|accent)/i;
    if (badClassRe.test(text)) {
      violations.push(`${file}: accent used in background/button context`);
    }
  }
}

if (violations.length) {
  console.error('\nBrand color audit errors:');
  for (const v of violations) console.error(' - ' + v);
  console.error('\nRule: Use accent only for 2px focus ring, tiny pill tags, subtle hover underline, and micro-icons.');
  process.exit(1);
} else {
  console.log('Brand color audit passed.');
}

