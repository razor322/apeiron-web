type ImageCreditProps = {
  credit?: string;
  sourceUrl?: string;
};

export function ImageCredit({ credit, sourceUrl }: ImageCreditProps) {
  if (!credit) return null;
  return (
    <p className="font-sans text-xs text-dust">
      {credit}
      {sourceUrl ? (
        <>
          {" "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber underline"
          >
            {sourceUrl}
          </a>
        </>
      ) : null}
    </p>
  );
}
