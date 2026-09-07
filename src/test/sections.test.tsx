import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppCta, PageHero } from "@/components/sections";

describe("public marketing components", () => {
  it("links to the live Google Play listing", () => {
    render(<AppCta />);
    const link = screen.getByRole("link", { name: "Google Play" });
    expect(link).toHaveAttribute(
      "href",
      "https://play.google.com/store/apps/details?id=com.offsay.offsayapp",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
  });

  it("renders page hierarchy accessibly", () => {
    render(<PageHero eyebrow="About" title="Local value" description="A useful description." />);
    expect(screen.getByRole("heading", { level: 1, name: "Local value" })).toBeInTheDocument();
  });
});
