type SourceLinkProps = {
  name: string;
  url?: string;
  label?: string;
};

export function SourceLink({ name, url, label }: SourceLinkProps) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-sans text-sm text-amber underline"
    >
      {label ?? name}
    </a>
  );
}
