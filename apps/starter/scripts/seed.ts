#!/usr/bin/env -S node --enable-source-maps
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const menu = JSON.parse(readFileSync(join(process.cwd(), 'public', 'data', 'menu.json'), 'utf8'));
  const hero = JSON.parse(readFileSync(join(process.cwd(), 'public', 'data', 'hero.json'), 'utf8'));
  console.log(`Loaded ${menu.length} menu items and ${hero.length} hero slides.`);

  // Reset tables
  await prisma.changeLog.deleteMany({});
  await prisma.heroSlide.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.menuItemDraft.deleteMany({});

  for (const item of menu) {
    await prisma.menuItem.create({
      data: {
        id: item.id,
        name: item.name,
        description: item.description || null,
        category: item.category,
        pricesJson: JSON.stringify(item.prices || {}),
        orderLinksJson: JSON.stringify(item.orderLinks || {}),
        tagsJson: JSON.stringify(item.tags || []),
        image: item.image || null,
        isActive: item.isActive ?? true,
        lastChecked: item.lastChecked ? new Date(item.lastChecked) : null
      }
    });
  }

  let pos = 0;
  for (const slide of hero) {
    await prisma.heroSlide.create({
      data: { src: slide.src, alt: slide.alt, attribution: slide.attribution || null, position: pos++ }
    });
  }

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      address: '251-B Valley Blvd, Wood-Ridge, NJ 07075',
      phone: '(201) 559-2165',
      hoursJson: JSON.stringify({
        Tue: { open: '11:00', close: '19:00' },
        Wed: { open: '11:00', close: '19:00' },
        Thu: { open: '11:00', close: '19:00' },
        Fri: { open: '11:00', close: '19:00' },
        Sat: { open: '11:00', close: '19:00' },
        Sun: { open: '11:00', close: '17:00' },
        Mon: { closed: true }
      }),
      platformBaseUrlsJson: JSON.stringify({
        doordash: 'https://www.doordash.com/store/these-freakin-empanadas-and-more-wood-ridge-34379601/?srsltid=AfmBOop7RQWjGGjS_ozZrRP0mAFSNaHmv2phAm0y5CY9PepFgB4OLzIp',
        grubhub: 'https://www.grubhub.com/restaurant/these-freakin-empanadas-and-more-251-b-valley-blvd-wood-ridge/11509544'
      }),
      ctaTogglesJson: JSON.stringify({ doordash: true, grubhub: true })
    }
  });

  console.log('Seed complete.');
}

main().finally(async () => {
  await prisma.$disconnect();
});
