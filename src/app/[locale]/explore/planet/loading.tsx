import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <Skeleton className="h-10 w-52" />
        <div className="flex flex-col gap-10">
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 border-t border-[color:var(--line)] pt-5">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
