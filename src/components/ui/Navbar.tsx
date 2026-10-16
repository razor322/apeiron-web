"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Dictionary } from "@/i18n/en";

type NavbarProps = {
  locale: string;
  dict: Dictionary;
  children?: ReactNode;
};

// Routes are the only four that exist on disk; every href resolves the locale
// prefix so no link is dead.
export function Navbar({ locale, dict, children }: NavbarProps) {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/explore`, label: dict.nav.explore },
    { href: `/${locale}/cosmos-today`, label: dict.nav.cosmosToday },
    { href: `/${locale}/about`, label: dict.nav.about },
  ];

  return (
    <nav
      aria-label={dict.nav.label}
      className={`sticky top-0 z-50 border-b transition-colors ${
        solid
          ? "border-[color:var(--line)] bg-void"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 sm:px-6">
        <a href={`/${locale}`} className="font-serif text-xl text-starlight">
          {dict.nav.brand}
        </a>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-x-5">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-sans text-sm text-dust transition-colors hover:text-starlight"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {children}
      </div>
    </nav>
  );
}
