import type { Dictionary } from "@/i18n/en";

type ConfidenceType = keyof Dictionary["common"]["confidence"];

type DataLabelProps = {
  value: string;
  unit?: string;
  label: string;
  confidenceType?: ConfidenceType;
  dict: Dictionary;
};

export function DataLabel({
  value,
  unit,
  label,
  confidenceType,
  dict,
}: DataLabelProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-3xl text-starlight md:text-4xl">
        {value}
        {unit ? <span className="ml-2 text-xl text-dust">{unit}</span> : null}
      </span>
      <span className="font-sans text-sm text-dust">{label}</span>
      {confidenceType ? (
        <span className="font-mono text-xs uppercase tracking-wide text-dust">
          {dict.common.confidence[confidenceType]}
        </span>
      ) : null}
    </div>
  );
}
