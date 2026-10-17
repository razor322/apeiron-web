import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <Skeleton className="h-4 w-40" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-10 w-56" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-56" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 border-t border-[color:var(--line)] py-5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
