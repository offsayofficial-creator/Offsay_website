const launchTime = Date.parse("2026-11-06T00:00:00+05:30");

export function bindLaunchCountdown(scope: ParentNode) {
  const countdown = scope.querySelector<HTMLElement>("[data-launch-countdown]");
  if (!countdown) return () => {};
  const update = () => {
    const remaining = launchTime - Date.now();
    if (remaining <= 0) {
      countdown.textContent = "Launch day is here";
      countdown.classList.add("launch-countdown-complete");
      countdown.setAttribute("aria-label", "Launch day is here");
      clearInterval(timer);
      return;
    }
    const seconds = Math.ceil(remaining / 1000);
    const values = { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
    for (const [unit, value] of Object.entries(values)) {
      const element = countdown.querySelector(`[data-launch-${unit}]`);
      if (element) element.textContent = String(value).padStart(2, "0");
    }
    countdown.setAttribute("aria-label", `${values.days} days, ${values.hours} hours, ${values.minutes} minutes, ${values.seconds} seconds until expected launch`);
  };
  const timer = setInterval(update, 1000);
  update();
  return () => clearInterval(timer);
}
