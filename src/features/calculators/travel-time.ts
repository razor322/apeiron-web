export const TRAVEL_ASSUMPTION =
  "Simple illustrative calculation: it ignores acceleration, trajectory, and energy requirements.";

export type TravelTimeResult = {
  seconds: number;
  assumptionNote: string;
};

export function travelTime(
  distanceMeters: number,
  speedMps: number,
): TravelTimeResult {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    throw new Error("Enter a non-negative distance.");
  }
  if (!Number.isFinite(speedMps) || speedMps <= 0) {
    throw new Error("Enter a positive speed.");
  }
  return {
    seconds: distanceMeters / speedMps,
    assumptionNote: TRAVEL_ASSUMPTION,
  };
}
