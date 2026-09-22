"use client";

export default function CallbackLink({ target = "callback", source = "footer", children, ...props }) {
  return (
    <a {...props} href={`#${target}`} onClick={(event) => {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent("open-callback", { detail: { target, source } }));
      requestAnimationFrame(() => {
        const form = document.getElementById(target);
        form?.scrollIntoView({ block: "center" });
        (form?.querySelector('input[type="tel"]') ?? form)?.focus({ preventScroll: true });
      });
    }}>
      {children}
    </a>
  );
}
