import type { ReactNode } from "react";
import Link from "next/link";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "filled" | "ghost";
  ariaLabel?: string;
};

export function Button({
  children,
  href,
  onClick,
  variant = "filled",
  ariaLabel,
}: ButtonProps) {
  const base =
    "inline-flex min-h-11 min-w-11 items-center justify-center px-5 py-3 rounded-full font-sans text-sm transition-colors";
  const look =
    variant === "filled"
      ? "bg-amber text-void hover:bg-starlight"
      : "border border-[color:var(--line)] text-starlight hover:border-amber hover:text-amber";
  const className = `${base} ${look}`;

  if (href) {
    // Internal links use next/link for client-side navigation; external links
    // (mailto:, http) stay as anchors.
    if (href.startsWith("/")) {
      return (
        <Link href={href} aria-label={ariaLabel} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} aria-label={ariaLabel} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={className}>
      {children}
    </button>
  );
}
