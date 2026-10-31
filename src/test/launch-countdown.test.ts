import { afterEach, expect, it, vi } from "vitest";
import { bindLaunchCountdown } from "@/lib/launch-countdown";

afterEach(() => { vi.useRealTimers(); });
const fixture = () => {
  const scope = document.createElement("div");
  scope.innerHTML = '<div data-launch-countdown><strong data-launch-days>--</strong><strong data-launch-hours>--</strong><strong data-launch-minutes>--</strong><strong data-launch-seconds>--</strong></div>';
  return scope;
};
it("counts down in IST, updates each second, and cleans up", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-04T22:58:00+05:30"));
  const scope = fixture();
  const cleanup = bindLaunchCountdown(scope);
  expect(scope.querySelector("[data-launch-days]")?.textContent).toBe("01");
  expect(scope.querySelector("[data-launch-hours]")?.textContent).toBe("01");
  expect(scope.querySelector("[data-launch-minutes]")?.textContent).toBe("02");
  expect(scope.querySelector("[data-launch-seconds]")?.textContent).toBe("00");
  vi.advanceTimersByTime(1000);
  expect(scope.querySelector("[data-launch-minutes]")?.textContent).toBe("01");
  expect(scope.querySelector("[data-launch-seconds]")?.textContent).toBe("59");
  cleanup();
  expect(vi.getTimerCount()).toBe(0);
});
it.each(["2026-11-06T00:00:00+05:30", "2026-11-07T12:00:00+05:30"])("shows the launch-day message at or after %s", date => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(date));
  const scope = fixture();
  bindLaunchCountdown(scope);
  expect(scope.textContent).toBe("Launch day is here");
  expect(vi.getTimerCount()).toBe(0);
});
it("transitions at the target without a negative countdown", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-05T23:59:00+05:30"));
  const scope = fixture();
  bindLaunchCountdown(scope);
  vi.advanceTimersByTime(60_000);
  expect(scope.textContent).toBe("Launch day is here");
  expect(vi.getTimerCount()).toBe(0);
});
