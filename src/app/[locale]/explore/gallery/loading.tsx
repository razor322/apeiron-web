import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <Skeleton className="h-11 w-40" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        {Array.from({ length: 2 }).map((_, g) => (
          <div key={g} className="flex flex-col gap-4 border-t border-[color:var(--line)] pt-10">
            <Skeleton className="h-8 w-40" />
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Container>
    </main>
  );
}
