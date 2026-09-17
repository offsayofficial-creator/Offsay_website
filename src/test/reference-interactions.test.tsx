import { fireEvent, render, waitFor } from "@testing-library/react";
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

it("binds navigation to its rendered content and rebinds after content changes", () => {
  const page = (title: string) => `<button id="navToggle">Menu</button><nav id="navLinks"><a href="#section">${title}</a></nav><section id="section" class="reveal">Section</section>`;
  const { container, rerender, unmount } = render(<ReferenceInteractions html={page("Home")} />);
  const toggle = () => container.querySelector<HTMLButtonElement>("#navToggle")!;
  fireEvent.click(toggle());
  expect(container.querySelector("#navLinks")).toHaveClass("open");
  expect(toggle()).toHaveAttribute("aria-expanded", "true");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(toggle()).toHaveAttribute("aria-expanded", "false");
  rerender(<ReferenceInteractions html={page("Merchants")} />);
  fireEvent.click(toggle());
  expect(container.querySelector("#navLinks")).toHaveClass("open");
  fireEvent.click(container.querySelector("a")!);
  expect(container.querySelector("#navLinks")).not.toHaveClass("open");
  expect(container.querySelector(".reveal")).toHaveClass("in");
  unmount();
  expect(document.body).not.toHaveClass("nav-open");
});