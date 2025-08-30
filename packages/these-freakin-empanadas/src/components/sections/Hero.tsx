import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { HeroCarousel } from './HeroCarousel';
import type { HeroImage } from '../../types';

type Props = {
  images: HeroImage[];
  doordashUrl: string;
  grubhubUrl: string;
};

export function Hero({ images, doordashUrl, grubhubUrl }: Props) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-6">
      <HeroCarousel images={images} />
      <div className="mt-6 flex flex-col items-start gap-3 md:absolute md:inset-0 md:left-8 md:top-1/3 md:mt-0">
        <motion.h1 className="text-3xl font-semibold md:text-5xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          Bold, Crispy, Freakin’ Delicious.
        </motion.h1>
        <motion.p className="max-w-xl text-white/80" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          Hand-held flavor bombs—savory & sweet empanadas, sandwiches, and sides.
        </motion.p>
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="inline-flex overflow-hidden rounded-md border border-white/20">
            <a href={doordashUrl} target="_blank" rel="noreferrer">
              <Button className="rounded-none">
                <img src="/images/DoorDash.png" alt="Order on DoorDash" className="h-6 w-auto" />
              </Button>
            </a>
            <a href={grubhubUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" className="rounded-none border-l border-white/20">
                <img src="/images/Grubhub.png" alt="Order on Grubhub" className="h-6 w-auto" />
              </Button>
            </a>
          </div>
          <a href="#menu">
            <Button variant="outline">View Menu</Button>
          </a>
        </div>
      </div>
    </section>
  );
}
