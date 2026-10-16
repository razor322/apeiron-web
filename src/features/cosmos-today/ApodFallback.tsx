import type { Dictionary } from "@/i18n/en";
import { ErrorState } from "@/components/ui/ErrorState";
import { SourceLink } from "@/components/ui/SourceLink";

type ApodFallbackProps = {
  dict: Dictionary;
};

export function ApodFallback({ dict }: ApodFallbackProps) {
  return (
    <div className="flex flex-col gap-4">
      <ErrorState title={dict.cosmosToday.loadError} />
      <SourceLink name={dict.cosmosToday.apodLabel} url={dict.cosmosToday.apodUrl} />
    </div>
  );
}
