// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { DataLabel } from "@/components/ui/DataLabel";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { en } from "@/i18n/en";

describe("core UI", () => {
  it("Button renders an anchor when href is given", () => {
    render(<Button href="/explore">Explore</Button>);
    const el = screen.getByRole("link", { name: "Explore" });
    expect(el).toHaveAttribute("href", "/explore");
  });

  it("Button renders a button when no href", () => {
    render(<Button onClick={() => {}}>Start</Button>);
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });

  it("DataLabel shows value, unit, and a text status from the dictionary", () => {
    render(
      <DataLabel
        value="12,742"
        unit="km"
        label="Earth diameter"
        confidenceType="measured"
        dict={en}
      />,
    );
    expect(screen.getByText(/12,742/)).toBeInTheDocument();
    expect(screen.getByText("km")).toBeInTheDocument();
    expect(screen.getByText(/measured/i)).toBeInTheDocument();
  });

  it("LoadingState announces politely", () => {
    render(<LoadingState label="Loading image" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading image");
  });

  it("ErrorState announces as alert", () => {
    render(<ErrorState title="Failed to load" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load");
  });
});
