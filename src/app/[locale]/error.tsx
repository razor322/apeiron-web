"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-start justify-center gap-6 px-6">
      <p className="font-sans text-dust">Something went wrong loading this section.</p>
      <button
        type="button"
        onClick={reset}
        className="min-h-11 min-w-11 rounded-full bg-amber px-5 py-3 font-sans text-void"
      >
        Try again
      </button>
    </main>
  );
}
