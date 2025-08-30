import * as React from 'react';
import { Button } from '../ui/Button';

type Props = {
  restaurantName: string;
  doordashUrl: string;
  grubhubUrl: string;
};

export function Header({ restaurantName, doordashUrl, grubhubUrl }: Props) {
  const [open, setOpen] = React.useState(false);
  const [show, setShow] = React.useState(false); // mount drawer only when true

  const closeMenu = React.useCallback(() => {
    setOpen(false);
    // Unmount after transition ends
    window.setTimeout(() => setShow(false), 300);
  }, []);

  const openMenu = React.useCallback(() => {
    setShow(true);
    // Wait a frame so transition triggers
    requestAnimationFrame(() => setOpen(true));
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeMenu]);

  React.useEffect(() => {
    // Lock body scroll when drawer is open
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-3">
          <img
            src="/images/Logo.png"
            alt={`${restaurantName} logo`}
            className="h-8 w-auto"
          />
          <span className="text-lg font-semibold hidden sm:inline">{restaurantName}</span>
        </a>

        {/* Desktop nav */}
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

        {/* Desktop order buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <a href={doordashUrl} target="_blank" rel="noreferrer">
            <Button>
              <img src="/images/DoorDash.png" alt="Order on DoorDash" className="h-6 w-auto scale-125" />
            </Button>
          </a>
          <a href={grubhubUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary">
              <img src="/images/Grubhub.png" alt="Order on Grubhub" className="h-6 w-auto" />
            </Button>
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="tfe-focus-ring md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/5 hover:bg-white/10"
          onClick={() => (open ? closeMenu() : openMenu())}
        >
          <svg
            className="h-5 w-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {open ? (
              // X icon
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              // Hamburger icon
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>

        {/* Mobile slide-in drawer + overlay (mounted only when shown) */}
        {show && (
          <div className="fixed inset-0 z-50 md:hidden" aria-hidden={!open}>
            <div
              className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
              onClick={closeMenu}
            />
            <div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
              className={`absolute right-0 top-0 h-full w-72 max-w-[80%] border-l border-white/10 bg-black/95 p-4 shadow-xl backdrop-blur transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  aria-label="Close menu"
                  className="tfe-focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 hover:bg-white/10"
                  onClick={closeMenu}
                >
                  <svg
                    className="h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="mt-3 grid gap-1">
                <a
                  href="#menu"
                  className="block rounded px-3 py-2 hover:bg-white/10"
                  onClick={closeMenu}
                >
                  Menu
                </a>
                <a
                  href="#about"
                  className="block rounded px-3 py-2 hover:bg-white/10"
                  onClick={closeMenu}
                >
                  About
                </a>
                <a
                  href="#reviews"
                  className="block rounded px-3 py-2 hover:bg-white/10"
                  onClick={closeMenu}
                >
                  Reviews
                </a>
                <a
                  href="#contact"
                  className="block rounded px-3 py-2 hover:bg-white/10"
                  onClick={closeMenu}
                >
                  Contact
                </a>
              </nav>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={doordashUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>
                  <Button className="w-full">
                    <img src="/images/DoorDash.png" alt="Order on DoorDash" className="h-6 w-auto mx-auto scale-125" />
                  </Button>
                </a>
                <a href={grubhubUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>
                  <Button variant="secondary" className="w-full">
                    <img src="/images/Grubhub.png" alt="Order on Grubhub" className="h-6 w-auto mx-auto" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
