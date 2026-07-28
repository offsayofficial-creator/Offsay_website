import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppCta, PageHero } from "@/components/sections";

describe("public marketing components", () => {
  it("shows a coming-soon state while store links are unavailable", () => {
    render(<AppCta />);
    expect(screen.getByText("OffSay app coming soon")).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("renders page hierarchy accessibly", () => {
    render(<PageHero eyebrow="About" title="Local value" description="A useful description." />);
    expect(screen.getByRole("heading", { level: 1, name: "Local value" })).toBeInTheDocument();
  });
});
