export function showEnquirySuccess(returnFocus: HTMLElement): () => void {
  const dialog = document.createElement("dialog");
  dialog.className = "enquiry-success";
  dialog.setAttribute("aria-labelledby", "enquiry-success-title");
  dialog.setAttribute("aria-describedby", "enquiry-success-description");
  dialog.innerHTML = `<button type="button" class="enquiry-success-close" aria-label="Close success dialog">×</button>
    <div class="enquiry-success-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path pathLength="1" d="m12 25 8 8 16-18" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <h2 id="enquiry-success-title">Enquiry submitted successfully!</h2>
    <p id="enquiry-success-description">Thank you for contacting OffSay. Your enquiry has been received.</p>
    <button type="button" class="btn btn-primary enquiry-success-done">Done</button>`;
  const close = () => { dialog.close(); dialog.remove(); if (returnFocus.isConnected) returnFocus.focus(); };
  dialog.querySelectorAll("button").forEach(button => button.addEventListener("click", close));
  dialog.addEventListener("cancel", event => { event.preventDefault(); close(); });
  dialog.addEventListener("keydown", event => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    if (event.key !== "Tab") return;
    const buttons = dialog.querySelectorAll<HTMLButtonElement>("button");
    if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[1].focus(); }
    else if (!event.shiftKey && document.activeElement === buttons[1]) { event.preventDefault(); buttons[0].focus(); }
  });
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector<HTMLButtonElement>(".enquiry-success-done")!.focus();
  return () => { dialog.close(); dialog.remove(); };
}
