import TheseFreakinEmpanadas from 'these-freakin-empanadas';
import heroImages from '../public/data/hero.json';
import menuData from '../public/data/menu.json';
import { MenuJSONLD } from '@/src/lib/seo';

export default async function HomePage() {
  // Use static data; no DB/auth required
  const normalized = (menuData as any[]).map((m: any) => ({
    ...m,
    prices: m.prices ?? JSON.parse(m.pricesJson || '{}'),
    orderLinks: m.orderLinks ?? JSON.parse(m.orderLinksJson || '{}'),
    tags: m.tags ?? JSON.parse(m.tagsJson || '[]')
  }));
  const sections: Record<string, any[]> = {};
  for (const i of normalized) (sections[i.category] ||= []).push(i);
  const sectionArray = Object.entries(sections).map(([name, items]) => ({ name, items }));
  return (
    <>
      <TheseFreakinEmpanadas heroImages={heroImages as any} />
      <MenuJSONLD sections={sectionArray} />
    </>
  );
}
