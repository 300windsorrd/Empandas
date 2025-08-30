import React from 'react';

export function RestaurantJSONLD({ name, address, phone, hours, sameAs }: { name: string; address: string; phone: string; hours: any; sameAs: string[] }) {
  const openingHours = Object.entries(hours || {}).flatMap(([day, spec]: any) => {
    if (spec?.closed) return [];
    return [{ dayOfWeek: day, opens: spec.open, closes: spec.close }];
  });
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name,
    address,
    telephone: phone,
    openingHoursSpecification: openingHours,
    sameAs
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function MenuJSONLD({ sections }: { sections: Array<{ name: string; items: any[] }> }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    hasMenuSection: sections.map((s) => ({
      '@type': 'MenuSection',
      name: s.name,
      hasMenuItem: s.items.map((i: any) => ({
        '@type': 'MenuItem',
        name: i.name,
        description: i.description,
        image: i.image,
        offers: [
          i.prices?.doordash && i.orderLinks?.doordash
            ? { '@type': 'Offer', priceCurrency: 'USD', price: i.prices.doordash, url: i.orderLinks.doordash }
            : null,
          i.prices?.grubhub && i.orderLinks?.grubhub
            ? { '@type': 'Offer', priceCurrency: 'USD', price: i.prices.grubhub, url: i.orderLinks.grubhub }
            : null
        ].filter(Boolean)
      }))
    }))
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

