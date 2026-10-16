// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { ApodCard } from "@/features/cosmos-today/ApodCard";
import { ApodFallback } from "@/features/cosmos-today/ApodFallback";
import { en } from "@/i18n/en";

afterEach(cleanup);

const media = {
  id: "apod",
  title: "Andromeda",
  mediaType: "image" as const,
  previewUrl: "https://example.org/a.jpg",
  originalUrl: "https://example.org/a.jpg",
  sourceName: "NASA APOD",
  sourceUrl: "https://apod.nasa.gov",
  credit: "Jane Doe",
  altText: "Galaksi Andromeda",
  explanation: "A spiral galaxy seen edge-on.",
  publishedAt: "2026-10-14",
  retrievedAt: "2026-10-14T06:00:00Z",
};

const snap = {
  data: media,
  provider: "apod",
  sourceUrl: "https://apod.nasa.gov",
  retrievedAt: "2026-10-14T06:00:00Z",
  stale: false,
};

describe("ApodCard", () => {
  it("shows title, credit, and retrieval date", () => {
    render(<ApodCard snapshot={snap} dict={en} />);
    expect(screen.getByRole("heading", { name: "Andromeda" })).toBeInTheDocument();
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    expect(screen.getByText(/retrieved on/i)).toBeInTheDocument();
  });

  it("shows a stale notice when the snapshot is stale", () => {
    render(<ApodCard snapshot={{ ...snap, stale: true }} dict={en} />);
    expect(screen.getByText(/stored data/i)).toBeInTheDocument();
  });

  it("renders the explanation when present", () => {
    render(<ApodCard snapshot={snap} dict={en} />);
    expect(screen.getByText("A spiral galaxy seen edge-on.")).toBeInTheDocument();
  });

  it("renders an img for image media", () => {
    render(<ApodCard snapshot={snap} dict={en} />);
    expect(screen.getByRole("img", { name: "Galaksi Andromeda" })).toBeInTheDocument();
  });

  it("renders a source link, not an img, for non-image media", () => {
    render(
      <ApodCard
        snapshot={{ ...snap, data: { ...media, mediaType: "video" as const } }}
        dict={en}
      />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /official source/i })).toBeInTheDocument();
  });
});

describe("ApodFallback", () => {
  it("shows the load error and links to APOD", () => {
    render(<ApodFallback dict={en} />);
    expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /APOD/i })).toBeInTheDocument();
  });
});
