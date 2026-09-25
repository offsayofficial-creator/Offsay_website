import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { bindContactForm } from "@/lib/contact-form";

let cleanup = () => {};
afterEach(() => { cleanup(); document.body.innerHTML = ""; vi.unstubAllGlobals(); });
function setup(message = "") {
  HTMLDialogElement.prototype.showModal = function() { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function() { this.removeAttribute("open"); };
  document.body.innerHTML = `<form data-contact-form><input name="name" value="Visitor" required><input name="email" type="email" value="visitor@example.com" required><input name="subject" value="Question" required><select name="role"><option>Shopper / App user</option></select><textarea name="message"></textarea><input name="website" value=""><button type="submit">Submit enquiry</button><p data-contact-status role="status"></p></form>`;
  document.querySelector("textarea")!.value = message;
  cleanup = bindContactForm(document);
  return document.querySelector("form")!;
}
describe("contact form", () => {
  for (const message of ["", "   ", "Hello team"]) {
    it(`sends optional message ${JSON.stringify(message)} and clears after success`, async () => {
      const fetcher = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", fetcher);
      const form = setup(message);
      fireEvent.submit(form);
      await waitFor(() => expect(document.querySelector("[role=status]")).toHaveTextContent("Your enquiry has been received"));
      expect(document.querySelector("dialog[open]")).toHaveTextContent("Enquiry submitted successfully!");
      expect(fetcher.mock.calls[0][0]).toMatch(/\/api\/v1\/contact\/$/);
      expect(JSON.parse(fetcher.mock.calls[0][1].body).message).toBe(message);
      expect(document.querySelector("textarea")!.value).toBe("");
    });
  }
  it("blocks duplicate requests while pending", async () => {
    let resolve!: (value: {ok:boolean}) => void;
    const fetcher = vi.fn(() => new Promise(r => { resolve = r; }));
    vi.stubGlobal("fetch", fetcher);
    const form = setup();
    fireEvent.submit(form); fireEvent.submit(form);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(document.querySelector("button")).toBeDisabled();
    resolve({ok:true});
    await waitFor(() => expect(document.querySelector("button")).not.toBeDisabled());
  });
  for (const status of [400, 429, 503]) {
    it(`preserves values and enables retry after ${status}`, async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ok:false,status}));
      const form = setup("Keep my message");
      fireEvent.submit(form);
      await waitFor(() => expect(document.querySelector("button")).not.toBeDisabled());
      expect(document.querySelector("textarea")!.value).toBe("Keep my message");
      expect(document.querySelector("dialog")).toBeNull();
      expect(document.querySelector("[role=status]")!.textContent).not.toBe("");
    });
  }
  it("does not submit invalid required fields", () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const form = setup();
    (form.elements.namedItem("email") as HTMLInputElement).value = "invalid";
    fireEvent.submit(form);
    expect(fetcher).not.toHaveBeenCalled();
  });
});

it("contains keyboard focus and restores submit focus on Escape", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  const form = setup(); fireEvent.submit(form);
  await waitFor(() => expect(document.querySelector("dialog[open]")).not.toBeNull());
  const dialog = document.querySelector("dialog")!;
  const buttons = dialog.querySelectorAll("button");
  expect(document.activeElement).toBe(buttons[1]);
  fireEvent.keyDown(dialog, { key: "Tab" }); expect(document.activeElement).toBe(buttons[0]);
  fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true }); expect(document.activeElement).toBe(buttons[1]);
  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(document.querySelector("dialog")).toBeNull();
  expect(document.activeElement).toBe(form.querySelector("button"));
});
