type ImageCreditProps = {
  credit?: string;
  sourceUrl?: string;
  // When the credit sits inside another link (a card), it must not render its
  // own <a> (nested anchors are invalid HTML and break hydration). link={false}
  // renders the credit as plain text.
  link?: boolean;
};

export function ImageCredit({ credit, sourceUrl, link = true }: ImageCreditProps) {
  if (!credit) return null;
  return (
    <p className="truncate font-sans text-xs text-dust">
      {credit}
      {link && sourceUrl ? (
        <>
          {" "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber underline"
          >
            Source
          </a>
        </>
      ) : null}
    </p>
  );
}
