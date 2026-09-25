import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Partners } from "@/components/partners";
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const item = { id: "1", name: "Local Store", logo: "/logo.png", category: "Food", locality: "Town", district: "District" };
const response = (results = [item], next: string | null = null) => ({ ok: true, json: async () => ({ results, next }) });
it("shows preview, non-clickable logos and broken logo fallback", async () => {
  const fetcher = vi.fn().mockResolvedValue(response()); vi.stubGlobal("fetch", fetcher);
  render(<Partners preview />);
  expect(await screen.findByText("Local Store")).toBeInTheDocument();
  expect(fetcher.mock.calls[0][0]).toContain("page_size=100");
  expect(screen.queryByRole("link", { name: /View merchants/ })).not.toBeInTheDocument();
  const logo = screen.getByRole("img", { name: "Local Store logo" }); expect(logo.closest("a")).toBeNull();
  fireEvent.error(logo); expect(screen.getByText("LS")).toBeInTheDocument();
});
it("retains cards after pagination failure and retries the same page", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(response([item], "next")).mockRejectedValueOnce(new Error()).mockResolvedValueOnce(response([{ ...item, id: "2", name: "Second Store", logo: "" }]));
  vi.stubGlobal("fetch", fetcher); render(<Partners />);
  await screen.findByText("Local Store"); fireEvent.click(screen.getByRole("button", { name: "Load more" }));
  await screen.findByText(/Unable to load/); expect(screen.getByText("Local Store")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByText("Second Store"); expect(fetcher.mock.calls[1][0]).toEqual(fetcher.mock.calls[2][0]);
});
it("handles empty lists and initial failures", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValueOnce(response([])));
  render(<Partners />); await screen.findByText(/Unable to load/);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(screen.getByText(/will appear here soon/)).toBeInTheDocument());
});


it("automatically includes subsequent merchant pages on the homepage", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(response([item], "next")).mockResolvedValueOnce(response([{ ...item, id: "2", name: "Another Merchant" }]));
  vi.stubGlobal("fetch", fetcher); render(<Partners preview />);
  await screen.findByText("Another Merchant");
  expect(screen.getByText("Local Store")).toBeInTheDocument();
  expect(fetcher.mock.calls[1][0]).toContain("page=2");
});
