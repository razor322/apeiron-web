import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

// Skeleton shaped like the calculators page: heading + intro, then two
// calculator blocks (label, input, result line) each with its assumptions note.
export default function Loading() {
  return (
    <main className="py-16">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            <Skeleton className="h-8 w-64" />
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-11 w-52" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-11 w-52" />
              </div>
            </div>
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
        ))}
      </Container>
    </main>
  );
}
