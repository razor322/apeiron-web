import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <Skeleton className="h-11 w-40" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        {Array.from({ length: 2 }).map((_, s) => (
          <div key={s} className="flex flex-col gap-2 border-t border-[color:var(--line)] pt-10">
            <Skeleton className="h-7 w-48" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 border-t border-[color:var(--line)] py-5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-72" />
              </div>
            ))}
          </div>
        ))}
      </Container>
    </main>
  );
}
