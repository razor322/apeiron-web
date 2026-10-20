// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  SolarSystem,
  WebGLUnavailableError,
  frameDelta,
  deviceTier,
} from "@/features/solar-system-3d/SolarSystem";

describe("frameDelta", () => {
  it("returns the elapsed seconds between two times", () => {
    expect(frameDelta(1000, 1016)).toBeCloseTo(0.016, 9);
  });
  it("clamps a long stall to 0.1 s", () => {
    expect(frameDelta(0, 5000)).toBe(0.1);
  });
  it("never goes negative for a backwards clock", () => {
    expect(frameDelta(2000, 1000)).toBe(0);
  });
  it("clamps exactly at the 0.1 bound", () => {
    expect(frameDelta(0, 100)).toBe(0.1);
    expect(frameDelta(0, 99)).toBeLessThan(0.1);
  });
});

describe("deviceTier", () => {
  it("picks low on a weak mobile device", () => {
    expect(deviceTier(1, 2, true)).toBe("low");
  });
  it("picks high on a strong desktop device", () => {
    expect(deviceTier(2, 16, false)).toBe("high");
  });
  it("picks medium in between", () => {
    expect(deviceTier(1.5, 6, false)).toBe("medium");
  });
});

function fakeCanvas(getContext: () => unknown): HTMLCanvasElement {
  return { getContext } as unknown as HTMLCanvasElement;
}

// Minimal WebGL context so WebGLRenderer constructs under jsdom; every member
// is a no-op or a plausible constant, enough for construction and dispose.
function stubWebGLContext(): WebGLRenderingContext {
  const gl = new Proxy(
    {},
    {
      get(target: Record<string, unknown>, prop: string) {
        if (prop in target) return target[prop];
        if (prop === "getParameter")
          return (p?: unknown) => (p === 0x1f02 ? "WebGL 2.0 (stub)" : 4096);
        if (prop === "VERSION") return 0x1f02;
        if (prop === "getExtension") return () => null;
        if (prop === "getShaderPrecisionFormat")
          return () => ({ rangeMin: 127, rangeMax: 127, precision: 23 });
        if (prop === "getContextAttributes") return () => ({ alpha: false });
        if (prop === "createShader" || prop === "createProgram" || prop === "createBuffer")
          return () => ({});
        return () => {};
      },
      set(target: Record<string, unknown>, prop: string, value: unknown) {
        target[prop] = value;
        return true;
      },
    },
  ) as unknown as WebGLRenderingContext;
  return gl;
}

function webglCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  Object.defineProperties(canvas, {
    clientWidth: { value: 800 },
    clientHeight: { value: 600 },
  });
  canvas.getContext = (() =>
    stubWebGLContext()) as unknown as HTMLCanvasElement["getContext"];
  return canvas;
}

describe("SolarSystem", () => {
  it("throws a typed WebGLUnavailableError when WebGL is missing", () => {
    const canvas = fakeCanvas(() => null);
    expect(() => new SolarSystem(canvas)).toThrow(WebGLUnavailableError);
  });

  it("exposes the public API and readonly info", () => {
    const sys = new SolarSystem(webglCanvas());
    expect(sys.info).toMatchObject({
      tier: expect.any(String),
      fps: expect.any(Number),
      drawCalls: expect.any(Number),
      triangles: expect.any(Number),
    });
    expect(typeof sys.on("tier", () => {})).toBe("function");
    sys.dispose();
  });

  it("has an idempotent dispose", () => {
    const sys = new SolarSystem(webglCanvas());
    expect(() => sys.dispose()).not.toThrow();
    expect(() => sys.dispose()).not.toThrow();
  });
});
