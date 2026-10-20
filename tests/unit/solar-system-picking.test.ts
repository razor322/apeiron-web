import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  proxyRadius,
  focusDistance,
  isBehindSun,
  PROXY_MIN_RADIUS,
  FOCUS_K,
} from "@/features/solar-system-3d/picking";
import {
  labelVisible,
  resolveCollisions,
} from "@/features/solar-system-3d/labels";

describe("proxyRadius", () => {
  it("swells a tiny body up to the clickable floor", () => {
    expect(proxyRadius(0.12)).toBe(PROXY_MIN_RADIUS);
  });
  it("leaves a large body at its real radius", () => {
    expect(proxyRadius(3.5)).toBe(3.5);
  });
});

describe("focusDistance", () => {
  it("is k times the radial extent", () => {
    expect(focusDistance(2, 5, 160)).toBeCloseTo(FOCUS_K * 2, 9);
  });
  it("counts the ring extent in the body size", () => {
    const withRings = focusDistance(1.51 + 3.52, 5, 160);
    const withoutRings = focusDistance(1.51, 5, 160);
    expect(withRings).toBeGreaterThan(withoutRings);
  });
  it("clamps below to the camera min distance", () => {
    expect(focusDistance(0.01, 5, 160)).toBe(5);
  });
  it("clamps above to the camera max distance", () => {
    expect(focusDistance(1000, 5, 160)).toBe(160);
  });
});

describe("isBehindSun", () => {
  const camera = new THREE.Vector3(0, 0, 100);

  it("hides a body directly behind the Sun from the camera", () => {
    const body = new THREE.Vector3(0, 0, -100);
    expect(isBehindSun(body, camera, 0.05)).toBe(true);
  });
  it("keeps a body off to the side of the Sun", () => {
    const body = new THREE.Vector3(50, 0, -50);
    expect(isBehindSun(body, camera, 0.05)).toBe(false);
  });
  it("keeps a body in front of the Sun even when aligned", () => {
    const body = new THREE.Vector3(0, 0, 50);
    expect(isBehindSun(body, camera, 0.05)).toBe(false);
  });
});

describe("labelVisible", () => {
  const camera = new THREE.Vector3(0, 0, 100);
  it("is false when labels are off", () => {
    expect(labelVisible(false, new THREE.Vector3(0, 0, -100), camera, 0.05)).toBe(false);
  });
  it("is false for a body behind the Sun", () => {
    expect(labelVisible(true, new THREE.Vector3(0, 0, -100), camera, 0.05)).toBe(false);
  });
  it("is true for a visible body", () => {
    expect(labelVisible(true, new THREE.Vector3(30, 0, 0), camera, 0.05)).toBe(true);
  });
});

describe("resolveCollisions", () => {
  it("keeps the nearer label and drops the overlapping one", () => {
    const kept = resolveCollisions([
      { id: "far", depth: 0.8, x: 10, y: 10, width: 40, height: 16 },
      { id: "near", depth: 0.2, x: 12, y: 12, width: 40, height: 16 },
    ]);
    expect(kept.has("near")).toBe(true);
    expect(kept.has("far")).toBe(false);
  });
  it("keeps labels that do not overlap", () => {
    const kept = resolveCollisions([
      { id: "a", depth: 0.2, x: 0, y: 0, width: 40, height: 16 },
      { id: "b", depth: 0.4, x: 200, y: 0, width: 40, height: 16 },
    ]);
    expect(kept.size).toBe(2);
  });
});
