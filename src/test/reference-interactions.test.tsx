import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReferenceInteractions } from "@/components/reference-interactions";

describe("store badge interactions", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it("intercepts only the unavailable App Store badge", async () => {
    const { container } = render(
      <>
        <a className="store-badge" data-coming-soon data-store-name="the App Store" href="#">
          App Store
        </a>
        <a
          className="store-badge"
          href="https://play.google.com/store/apps/details?id=com.offsay.offsayapp"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Play
        </a>
        <ReferenceInteractions />
      </>,
    );

    const appStore = container.querySelector<HTMLAnchorElement>("[data-coming-soon]")!;
    const googlePlay = container.querySelector<HTMLAnchorElement>("a[href*='play.google.com']")!;

    await waitFor(() => expect(appStore.getAttribute("aria-label")).toContain("coming soon"));
    expect(googlePlay).not.toHaveAttribute("aria-label");

    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    appStore.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(document.querySelector("[data-coming-soon-message]")).toHaveTextContent(
      "OffSay will be available on the App Store soon.",
    );
  });
});
