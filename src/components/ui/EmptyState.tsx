type EmptyStateProps = {
  title: string;
  hint?: string;
};

export function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-sans text-base text-starlight">{title}</p>
      {hint ? <p className="font-sans text-sm text-dust">{hint}</p> : null}
    </div>
  );
}
