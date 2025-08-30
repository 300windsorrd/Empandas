import * as React from 'react';
import { cn } from '../utils/cn';

export function MenuItemImage({
  src,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
  const [errored, setErrored] = React.useState(false);
  if (!src || errored) return null;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn('h-20 w-20 rounded-md border border-white/20 object-cover', className)}
      onError={() => setErrored(true)}
      {...props}
    />
  );
}
