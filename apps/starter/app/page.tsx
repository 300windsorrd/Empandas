import TheseFreakinEmpanadas from 'these-freakin-empanadas';
import heroImages from '../public/data/hero.json';
import { RestaurantJSONLD, MenuJSONLD } from '@/src/lib/seo';

export default async function HomePage() {
  let settings: any = null;
  let menu: any[] = [];
  try {
    const { prisma } = await import('@/src/lib/db');
    [settings, menu] = await Promise.all([
      prisma.settings.findUnique({ where: { id: 1 } }),
      prisma.menuItem.findMany({ where: { isActive: true } })
    ]);
  } catch {
    // DB not ready; fall back to static component only
  }
  const normalized = (menu ?? []).map((m) => ({
    ...m,
    prices: JSON.parse(m.pricesJson || '{}'),
    orderLinks: JSON.parse(m.orderLinksJson || '{}'),
    tags: JSON.parse(m.tagsJson || '[]')
  }));
  const sections: Record<string, any[]> = {};
  for (const i of normalized) (sections[i.category] ||= []).push(i);
  const sectionArray = Object.entries(sections).map(([name, items]) => ({ name, items }));
  return (
    <>
      <TheseFreakinEmpanadas
        heroImages={heroImages as any}
        doordashUrl={settings ? JSON.parse(settings.platformBaseUrlsJson || '{}')['doordash'] : undefined}
        grubhubUrl={settings ? JSON.parse(settings.platformBaseUrlsJson || '{}')['grubhub'] : undefined}
      />
      {settings && (
        <RestaurantJSONLD
          name="These Freakin’ Empanadas & More"
          address={settings.address}
          phone={settings.phone}
          hours={JSON.parse(settings.hoursJson || '{}')}
          sameAs={[
            JSON.parse(settings.platformBaseUrlsJson || '{}')['doordash'],
            JSON.parse(settings.platformBaseUrlsJson || '{}')['grubhub'],
            'https://www.instagram.com/freakinempanadasandmore',
            'https://www.yelp.com/biz/these-freakin-empanadas-and-more'
          ]}
        />
      )}
      <MenuJSONLD
        sections={sectionArray}
        doordashUrl={settings ? JSON.parse(settings.platformBaseUrlsJson || '{}')['doordash'] : undefined}
        grubhubUrl={settings ? JSON.parse(settings.platformBaseUrlsJson || '{}')['grubhub'] : undefined}
      />
    </>
  );
}
