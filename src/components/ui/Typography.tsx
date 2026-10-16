import type { ReactNode } from "react";

type HeadingProps = {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
};

export function Heading({ level, children, className = "" }: HeadingProps) {
  const Tag = `h${level}` as const;
  const size =
    level === 1
      ? "text-5xl md:text-7xl"
      : level === 2
        ? "text-3xl md:text-5xl"
        : level === 3
          ? "text-2xl md:text-3xl"
          : "text-xl md:text-2xl";
  return (
    <Tag className={`font-serif leading-tight text-starlight ${size} ${className}`}>
      {children}
    </Tag>
  );
}

export function Body({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`font-sans text-base leading-relaxed text-starlight ${className}`}>
      {children}
    </p>
  );
}

export function Label({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`font-sans text-sm text-dust ${className}`}>{children}</span>
  );
}
