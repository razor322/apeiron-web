export type StageKind = "hero" | "mid" | "content" | "outro";

export type JourneyStageDef = {
  id: string;
  // label and ariaLabel hold dictionary KEYS, not copy. The visible string is
  // resolved from the active locale's dictionary with readCopy, so no UI text
  // lives in this module.
  label: string;
  ariaLabel: string;
  // Dictionary key for the giant editorial figure (the number the stage is about),
  // or null for stages that carry no single figure (hero, mid, galaxy, universe).
  figureKey: string | null;
  kind: StageKind;
  factIds: string[];
  // Scroll window [start, end] the stage owns, 0..1. Placed to line up with the
  // scene's zoom keyframes so the text and the camera describe the same moment.
  range: [number, number];
  exponent: number;
};

// Seven stages travelled as one continuous zoom, plus a mid transition. Exponents
// are the order of magnitude of each stage's subject in metres, from a person
// (10^0) to the observable universe (10^27); the ruler spans that range.
// A content stage's `range` is placed on the shared zoom curve so its midpoint
// exponent sits within a couple of orders of its declared `exponent`, and the
// range must stay inside the band the scene draws that object in. The zoom curve
// lives in exponent.ts so the ruler label, the copy, and the canvas agree.
export const STAGES: JourneyStageDef[] = [
  {
    id: "hero",
    label: "journey.stages.hero.label",
    ariaLabel: "journey.stages.hero.aria",
    figureKey: null,
    kind: "hero",
    factIds: [],
    range: [0, 0.09],
    exponent: 0,
  },
  {
    id: "mid",
    label: "journey.stages.mid.label",
    ariaLabel: "journey.stages.mid.aria",
    figureKey: null,
    kind: "mid",
    factIds: [],
    range: [0.09, 0.19],
    exponent: 0,
  },
  {
    id: "earth",
    label: "journey.stages.earth.label",
    ariaLabel: "journey.stages.earth.aria",
    figureKey: "journey.stages.earth.figure",
    kind: "content",
    factIds: ["earth-diameter", "earth-moon-distance", "milky-way-position", "milky-way-orbit-time"],
    range: [0.22, 0.34],
    exponent: 7,
  },
  {
    id: "solar-system",
    label: "journey.stages.solar-system.label",
    ariaLabel: "journey.stages.solar-system.aria",
    figureKey: "journey.stages.solar-system.figure",
    kind: "content",
    factIds: ["sunlight-earth", "sun-neptune-light"],
    range: [0.68, 0.86],
    exponent: 12,
  },
  {
    id: "star",
    label: "journey.stages.star.label",
    ariaLabel: "journey.stages.star.aria",
    figureKey: "journey.stages.star.figure",
    kind: "content",
    factIds: ["proxima-distance"],
    range: [0.90, 0.936],
    exponent: 16,
  },
  {
    id: "galaxy",
    label: "journey.stages.galaxy.label",
    ariaLabel: "journey.stages.galaxy.aria",
    figureKey: null,
    kind: "content",
    factIds: [],
    range: [0.94, 0.95],
    exponent: 21,
  },
  {
    id: "universe",
    label: "journey.stages.universe.label",
    ariaLabel: "journey.stages.universe.aria",
    figureKey: null,
    kind: "content",
    factIds: [],
    range: [0.96, 0.98],
    exponent: 27,
  },
  {
    id: "outro",
    label: "journey.stages.outro.label",
    ariaLabel: "journey.stages.outro.aria",
    figureKey: null,
    kind: "outro",
    factIds: [],
    range: [0.97, 1.0],
    exponent: 27,
  },
];

export const MAX_EXPONENT = 27;

// The five stages that carry a real object and a name, used to label the ruler.
// The hero, the mid transition, and the outro are typographic and stay unlabelled.
export const NAMED_STAGES = STAGES.filter((stage) => stage.kind === "content");

// The stage that owns a scroll fraction, by its [start, end] range. The last
// stage claims the final frame so progress 1 never falls through.
export function activeStageIndex(progress: number): number {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    const [start] = STAGES[i]!.range;
    if (progress >= start) return i;
  }
  return 0;
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
