export function bindContactForm(scope: ParentNode): () => void {
  const form = scope.querySelector<HTMLFormElement>("[data-contact-form]");
  if (!form) return () => {};
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const status = form.querySelector<HTMLElement>("[data-contact-status]")!;
  const original = button.innerHTML;
  let pending = false;
  let disposed = false;
  let controller: AbortController | undefined;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.offsay.in").replace(/\/+$/, "");
  const endpoint = `${base.endsWith("/api/v1") ? base : `${base}/api/v1`}/contact/`;
  const submit = async (event: Event) => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    pending = true;
    controller = new AbortController();
    button.disabled = true;
    button.textContent = "Sending…";
    status.textContent = "";
    form.setAttribute("aria-busy", "true");
    const data = Object.fromEntries(new FormData(form).entries());
    const timeout = window.setTimeout(() => controller?.abort(), 30000);
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), signal: controller.signal,
      });
      if (disposed) return;
      if (!response.ok) {
        if (response.status === 429) throw new Error("Too many messages. Please wait before trying again.");
        if (response.status === 400) throw new Error("Please check your name, email, subject and message length, then try again.");
        throw new Error("Could not send your message. Please try again later or contact us on WhatsApp.");
      }
      form.reset();
      status.textContent = "Your enquiry has been sent. Thank you for contacting OffSay.";
    } catch (error) {
      if (!disposed) status.textContent = error instanceof Error && error.name !== "AbortError"
        ? (error instanceof TypeError ? "Unable to connect. Please try again or contact us on WhatsApp." : error.message)
        : "The request timed out. Delivery could not be confirmed; please wait before retrying.";
    } finally {
      window.clearTimeout(timeout);
      if (!disposed) {
        pending = false;
        button.disabled = false;
        button.innerHTML = original;
        form.removeAttribute("aria-busy");
      }
    }
  };
  form.addEventListener("submit", submit);
  return () => { disposed = true; controller?.abort(); form.removeEventListener("submit", submit); };
}
