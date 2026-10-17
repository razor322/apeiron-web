import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

// Route-level loading shell: the header plus a grid of placeholder cards, sized
// to match the real content so there is no layout shift when data arrives.
export default function Loading() {
  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="flex flex-col gap-3 border-t border-[color:var(--line)] pt-5">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
