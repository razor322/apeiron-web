export type StageKind = "hero" | "content" | "outro";

export type JourneyStageDef = {
  id: string;
  // label and ariaLabel hold dictionary KEYS, not copy. The visible string is
  // resolved from the active locale's dictionary with readCopy, so no UI text
  // lives in this module.
  label: string;
  ariaLabel: string;
  kind: StageKind;
  factIds: string[];
  exponent: number;
};

// Seven stages travelled as one continuous zoom. Exponents are the order of
// magnitude of each stage's subject in metres, from a person (10^0) to the
// observable universe (10^27); the ruler spans that range logarithmically.
export const STAGES: JourneyStageDef[] = [
  {
    id: "hero",
    label: "journey.stages.hero.label",
    ariaLabel: "journey.stages.hero.aria",
    kind: "hero",
    factIds: [],
    exponent: 0,
  },
  {
    id: "earth",
    label: "journey.stages.earth.label",
    ariaLabel: "journey.stages.earth.aria",
    kind: "content",
    factIds: ["earth-diameter", "earth-moon-distance"],
    exponent: 7,
  },
  {
    id: "solar-system",
    label: "journey.stages.solar-system.label",
    ariaLabel: "journey.stages.solar-system.aria",
    kind: "content",
    factIds: ["sunlight-earth", "sun-neptune-light"],
    exponent: 13,
  },
  {
    id: "star",
    label: "journey.stages.star.label",
    ariaLabel: "journey.stages.star.aria",
    kind: "content",
    factIds: ["proxima-distance"],
    exponent: 17,
  },
  {
    id: "galaxy",
    label: "journey.stages.galaxy.label",
    ariaLabel: "journey.stages.galaxy.aria",
    kind: "content",
    factIds: [],
    exponent: 21,
  },
  {
    id: "universe",
    label: "journey.stages.universe.label",
    ariaLabel: "journey.stages.universe.aria",
    kind: "content",
    factIds: [],
    exponent: 27,
  },
  {
    id: "outro",
    label: "journey.stages.outro.label",
    ariaLabel: "journey.stages.outro.aria",
    kind: "outro",
    factIds: [],
    exponent: 27,
  },
];

export const MAX_EXPONENT = 27;

export function activeStageIndex(progress: number): number {
  return Math.min(STAGES.length - 1, Math.floor(progress * STAGES.length));
}

// Resolve a dotted dictionary path to a string. Returns "" if the path is
// missing so components never render "undefined".
export function readCopy(source: unknown, path: string): string {
  const value = path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object") {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
  return typeof value === "string" ? value : "";
}
