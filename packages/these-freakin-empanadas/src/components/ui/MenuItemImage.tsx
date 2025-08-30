import * as React from 'react';
import { cn } from '../utils/cn';

type MenuItemImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  variant?: 'thumb' | 'fluid';
};

export function MenuItemImage({ src, alt, className, variant = 'thumb', ...props }: MenuItemImageProps) {
  const [errored, setErrored] = React.useState(false);
  if (!src || errored) return null;
  const size = variant === 'fluid' ? 'h-full w-full object-cover' : 'h-20 w-20 object-cover';
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(size, 'rounded-md border border-white/20', className)}
      onError={() => setErrored(true)}
      {...props}
    />
  );
}
