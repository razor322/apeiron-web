import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="py-16">
      <Container className="flex max-w-4xl flex-col gap-10">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="aspect-[16/9] w-full" />
      </Container>
    </main>
  );
}
