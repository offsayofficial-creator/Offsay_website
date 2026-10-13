import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClarityAnalytics } from "@/components/clarity-analytics";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("next/script", () => ({ default: ({ children, id }: { children: string; id: string }) => <div data-testid={id === "offsay-gtm" ? "gtm-script" : "clarity-script"}>{children}</div> }));
beforeEach(() => { pathname = "/"; localStorage.clear(); delete window.clarity; delete window.gtag; delete window.dataLayer; delete window.offsayGtmLoaded; });
afterEach(cleanup);
const renderAnalytics = (enabled = true, projectId = "ywwrf3d5be") => render(<ClarityAnalytics enabled={enabled} projectId={projectId} />);

describe("Clarity consent", () => {
  it("requires renewed consent before loading Google tags and Clarity together", async () => {
    localStorage.setItem("offsay-analytics-consent", "accepted");
    render(<ClarityAnalytics enabled projectId="ywwrf3d5be" gtmId="GTM-WCDZDKB5" />);
    fireEvent.click(await screen.findByRole("button", { name: "Accept" }));
    expect(screen.getByTestId("gtm-script")).toHaveTextContent("https://www.googletagmanager.com/gtm.js?id=GTM-WCDZDKB5");
    expect(screen.getByTestId("gtm-script")).toHaveTextContent("ad_personalization:'denied'");
    expect(screen.getByTestId("clarity-script")).toBeInTheDocument();
    expect(localStorage.getItem("offsay-analytics-consent-google-v1")).toBe("accepted");
  });
  it("blocks both providers after rejection", async () => {
    render(<ClarityAnalytics enabled projectId="ywwrf3d5be" gtmId="GTM-WCDZDKB5" />);
    fireEvent.click(await screen.findByRole("button", { name: "Reject" }));
    expect(screen.queryByTestId("gtm-script")).not.toBeInTheDocument();
    expect(screen.queryByTestId("clarity-script")).not.toBeInTheDocument();
  });
  it("does not load tracking until accepted and remembers acceptance", async () => {
    renderAnalytics();
    await screen.findByRole("button", { name: "Accept" });
    expect(screen.queryByTestId("clarity-script")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(screen.getByTestId("clarity-script")).toHaveTextContent("https://www.clarity.ms/tag/ywwrf3d5be");
    expect(screen.getByTestId("clarity-script")).toHaveTextContent("ad_Storage:'denied'");
    expect(localStorage.getItem("offsay-analytics-consent")).toBe("accepted");
  });
  it("rejects without loading tracking and allows changing the decision", async () => {
    renderAnalytics();
    fireEvent.click(await screen.findByRole("button", { name: "Reject" }));
    expect(screen.queryByTestId("clarity-script")).not.toBeInTheDocument();
    expect(localStorage.getItem("offsay-analytics-consent")).toBe("rejected");
    fireEvent.click(screen.getByRole("button", { name: "Analytics preferences" }));
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(screen.getByTestId("clarity-script")).toBeInTheDocument();
  });
  it("respects a saved rejection", async () => {
    localStorage.setItem("offsay-analytics-consent", "rejected");
    renderAnalytics();
    await screen.findByRole("button", { name: "Analytics preferences" });
    expect(screen.queryByRole("button", { name: "Accept" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("clarity-script")).not.toBeInTheDocument();
  });
  it("loads tracking for saved acceptance", async () => {
    localStorage.setItem("offsay-analytics-consent", "accepted");
    renderAnalytics();
    await waitFor(() => expect(screen.getByTestId("clarity-script")).toBeInTheDocument());
  });
  it.each(["/verify-email/", "/forgot-password/verify/"])("excludes %s", route => {
    pathname = route;
    localStorage.setItem("offsay-analytics-consent", "accepted");
    const { container } = renderAnalytics();
    expect(container).toBeEmptyDOMElement();
  });
  it.each([[false, "ywwrf3d5be"], [true, ""], [true, "invalid-id"]])("disables tracking for configuration %s %s", (enabled, id) => {
    const { container } = renderAnalytics(enabled, id);
    expect(container).toBeEmptyDOMElement();
  });
});
