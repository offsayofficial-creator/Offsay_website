import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { EmailVerificationHandler } from "../app/verify-email/verification-handler";

const mocks = vi.hoisted(() => ({ apply: vi.fn(), params: new URLSearchParams() }));
vi.mock("next/navigation", () => ({ useSearchParams: () => mocks.params }));
vi.mock("firebase/app", () => ({ getApps: () => [], initializeApp: () => ({}) }));
vi.mock("firebase/auth", () => ({ getAuth: () => ({}), applyActionCode: mocks.apply }));
beforeEach(() => {
  mocks.params = new URLSearchParams("mode=verifyEmail&oobCode=test&verification_id=11111111-1111-4111-8111-111111111111");
  mocks.apply.mockResolvedValue(undefined);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
function response(status: number, body: unknown, retry = "0") {
  return { ok: status === 200, status, json: async () => body, headers: new Headers({ "Retry-After": retry }) };
}
it("shows rate limiting rather than an unexplained failure", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(429, { error: { details: { detail: "Throttled" } } }, "60")));
  render(<EmailVerificationHandler />);
  expect(await screen.findByText(/Too many verification checks/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Try again in/ })).toBeDisabled();
});
it("reconciles an already consumed Firebase code", async () => {
  mocks.apply.mockRejectedValue({ code: "auth/invalid-action-code" });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(200, { resolved_status: "VERIFIED" })));
  render(<EmailVerificationHandler />);
  expect(await screen.findByRole("heading", { name: "Email verified" })).toBeInTheDocument();
});
it("allows retry after a network failure", async () => {
  const fetch = vi.fn().mockRejectedValueOnce(new Error("Network unavailable"))
    .mockResolvedValue(response(200, { resolved_status: "VERIFIED" }));
  vi.stubGlobal("fetch", fetch);
  render(<EmailVerificationHandler />);
  fireEvent.click(await screen.findByRole("button", { name: "Check verification again" }));
  expect(await screen.findByRole("heading", { name: "Email verified" })).toBeInTheDocument();
});
it("does not promise that resending renews an expired registration", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(410, { resolved_status: "EXPIRED" })));
  render(<EmailVerificationHandler />);
  expect(await screen.findByText(/contact OffSay support to restart/)).toBeInTheDocument();
});
