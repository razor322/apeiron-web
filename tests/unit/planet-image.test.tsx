// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { PlanetImage } from "@/features/explorer/PlanetImage";
import { getPlanetImage } from "@/features/explorer/planet-images";
import { en } from "@/i18n/en";

afterEach(cleanup);

describe("PlanetImage", () => {
  it("renders the image with its alt text", () => {
    const image = getPlanetImage("mars")!;
    render(<PlanetImage image={image} dict={en} />);
    expect(screen.getByAltText(image.altText)).toBeInTheDocument();
  });
  it("swaps to the fallback motif when the image fails to load", () => {
    const image = getPlanetImage("mars")!;
    render(<PlanetImage image={image} dict={en} />);
    fireEvent.error(screen.getByAltText(image.altText));
    expect(screen.queryByAltText(image.altText)).not.toBeInTheDocument();
    expect(screen.getByTestId("planet-image-fallback")).toBeInTheDocument();
  });
});
