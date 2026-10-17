import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

// Skeleton shaped like a topic detail page: back link, header, a key-number
// block, a terms list, and related links. Not the grid shell.
export default function Loading() {
  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <Skeleton className="h-11 w-40" />
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3 border-b border-[color:var(--line)] pb-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-72" />
            <Skeleton className="h-5 w-full max-w-2xl" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-32" />
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
