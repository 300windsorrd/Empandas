export type HeroImage = { src: string; alt: string; attribution?: string };

export type CustomStyles = {
  primaryColor: string; // default #000000
  secondaryColor: string; // default #FFFFFF
  accentColor: string; // default #02FCFD
  surfaceColor?: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  category:
    | 'Savory Empanadas'
    | 'Dessert Empanadas'
    | 'Combos'
    | 'Sandwiches'
    | 'Sides';
  prices: { doordash?: number; grubhub?: number };
  orderLinks: { doordash?: string; grubhub?: string };
  tags?: ('New' | 'Most-Loved' | 'Vegan' | 'Spicy')[];
  image?: string;
  isActive?: boolean;
  lastChecked?: string; // ISO date
};

export type TheseFreakinEmpanadasProps = {
  restaurantName?: string; // "These Freakin’ Empanadas & More"
  restaurantAddress?: string; // "251-B Valley Blvd, Wood-Ridge, NJ 07075"
  restaurantPhone?: string; // "(201) 559-2165"
  restaurantHours?: string; // "Tue–Sat 11:00 AM–7:00 PM; Sun 11:00 AM–5:00 PM; Mon closed"
  grubhubUrl?: string; // default provided
  doordashUrl?: string; // default provided
  heroImages?: HeroImage[];
  customStyles?: CustomStyles;
  className?: string;
};

