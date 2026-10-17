// A quiet shimmer block for loading states. No layout shift: callers set the
// aspect/size, so the placeholder occupies the same box as the content.
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-sm border border-[color:var(--line)] bg-[color:var(--line)] ${className}`}
    />
  );
}
