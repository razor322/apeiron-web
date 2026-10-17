// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { GalleryGrid } from "@/features/explorer/GalleryGrid";


afterEach(cleanup);

const media = [
  {
    id: "PIA1",
    title: "A nebula",
    mediaType: "image" as const,
    previewUrl: "https://images-assets.nasa.gov/image/PIA1/PIA1~medium.jpg",
    originalUrl: "https://images-assets.nasa.gov/image/PIA1/PIA1~medium.jpg",
    sourceName: "NASA Image and Video Library",
    sourceUrl: "https://images.nasa.gov/details/PIA1",
    credit: "NASA/ESA",
    altText: "A glowing nebula.",
    retrievedAt: "2026-10-17",
  },
];

describe("GalleryGrid", () => {
  it("renders the theme heading and image with credit", () => {
    render(<GalleryGrid title="Nebulae" media={media} />);
    expect(screen.getByRole("heading", { name: "Nebulae" })).toBeInTheDocument();
    expect(screen.getByAltText("A glowing nebula.")).toBeInTheDocument();
    expect(screen.getByText(/NASA\/ESA/)).toBeInTheDocument();
  });
  it("renders nothing for an empty group", () => {
    const { container } = render(<GalleryGrid title="Empty" media={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
