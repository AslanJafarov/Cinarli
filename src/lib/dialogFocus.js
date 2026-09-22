// Native dialogs make the background inert. Keep Tab within their visible controls too.
export function containDialogTab(event, dialog) {
  if (event.key !== "Tab") return;
  const controls = [...dialog.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
    .filter((element) => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length > 0);
  const first = controls[0];
  const last = controls.at(-1);
  if (!first) { event.preventDefault(); dialog.focus(); return; }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
}
