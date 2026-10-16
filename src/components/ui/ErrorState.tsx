type ErrorStateProps = {
  title: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col gap-2">
      <p className="font-sans text-base text-starlight">{title}</p>
      {message ? <p className="font-sans text-sm text-dust">{message}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 min-w-11 items-center justify-center self-start rounded-full border border-[color:var(--line)] px-5 py-3 font-sans text-sm text-amber"
        >
          {title}
        </button>
      ) : null}
    </div>
  );
}
