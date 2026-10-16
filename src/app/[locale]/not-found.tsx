import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-center gap-6 px-6">
      <p className="font-sans text-dust">Page not found.</p>
      <Link href="/" className="font-sans text-amber underline">
        Back to the journey
      </Link>
    </main>
  );
}
