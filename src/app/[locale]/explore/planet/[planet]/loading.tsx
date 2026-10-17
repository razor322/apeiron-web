import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

// Skeleton shaped like the planet detail page: back link, header, a large image,
// a five-column facts grid, the narrative, and related links. Not the grid shell.
export default function Loading() {
  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <Skeleton className="h-11 w-40" />
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-3 border-b border-[color:var(--line)] pb-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-14 w-64" />
            <Skeleton className="h-5 w-full max-w-2xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="aspect-[4/3] w-full max-w-3xl" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-prose" />
            <Skeleton className="h-4 w-5/6 max-w-prose" />
            <Skeleton className="h-4 w-3/4 max-w-prose" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-36" />
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
