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
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <a href={`/${locale}`} className="font-serif text-xl text-starlight">
          {dict.nav.brand}
        </a>
        <ul className="flex items-center gap-5">
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
