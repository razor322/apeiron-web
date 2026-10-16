export type ConfidenceType = "measured" | "estimated" | "approximate" | "calculated";
export type ScaleStage = "earth" | "solar-system" | "star" | "galaxy" | "universe";

export type CosmicFact = {
  id: string;
  title: string;
  value?: number | string;
  displayValue: string;
  unit?: string;
  summary: string;
  scaleStage?: ScaleStage;
  confidenceType: ConfidenceType;
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
  methodologyNote?: string;
};

export type AstronomyMedia = {
  id: string;
  title: string;
  mediaType: "image" | "video" | "other";
  previewUrl?: string;
  originalUrl?: string;
  sourceName: string;
  sourceUrl: string;
  credit?: string;
  rightsNote?: string;
  altText: string;
  explanation?: string;
  publishedAt?: string;
  retrievedAt: string;
};

export type AstronomySnapshot<T> = {
  data: T;
  provider: string;
  sourceUrl: string;
  retrievedAt: string;
  computedFor?: string;
  stale: boolean;
  attribution?: string;
};
