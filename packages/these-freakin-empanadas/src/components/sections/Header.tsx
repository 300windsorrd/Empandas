import * as React from 'react';
import { Button } from '../ui/Button';

type Props = {
  restaurantName: string;
  doordashUrl: string;
  grubhubUrl: string;
};

export function Header({ restaurantName, doordashUrl, grubhubUrl }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="text-lg font-semibold">{restaurantName}</div>
        <nav className="hidden gap-6 md:flex">
          <a href="#menu" className="hover:underline">
            Menu
          </a>
          <a href="#about" className="hover:underline">
            About
          </a>
          <a href="#reviews" className="hover:underline">
            Reviews
          </a>
          <a href="#contact" className="hover:underline">
            Contact
          </a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <a href={doordashUrl} target="_blank" rel="noreferrer">
            <Button>Order on DoorDash</Button>
          </a>
          <a href={grubhubUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary">Order on Grubhub</Button>
          </a>
        </div>
      </div>
    </header>
  );
}

