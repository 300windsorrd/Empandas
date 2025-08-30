import * as React from 'react';

type TooltipProps = {
  content: string;
  children: React.ReactNode;
};

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs text-white group-hover:block">
        {content}
      </span>
    </span>
  );
}

