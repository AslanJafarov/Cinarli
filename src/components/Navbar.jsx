"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useI18n } from "../i18n/client";
import { localeNames, locales, localizeHref, stripLocale } from "../i18n/config";
import { containDialogTab } from "../lib/dialogFocus";

const NAV_ITEMS = [
  // Plain anchors so the browser smooth-scrolls when already on the home page.
  { id: "layihe", href: "/#layihe", sectionId: "layihe" },
  { id: "menziller", href: "/menziller", page: "menziller", route: true },
  { id: "ustunlukler", href: "/#ustunlukler", sectionId: "ustunlukler" },
  { id: "yerlesme", href: "/#yerlesme", sectionId: "yerlesme" },
  { id: "qalereya", href: "/#qalereya", sectionId: "qalereya" },
];

function subscribe(callback) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback);
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
}

// "top" while over the hero, otherwise the id of the section in view ("" if none).
function getActiveSection() {
  if (window.scrollY < 40) return "top";

  const probe = window.innerHeight * 0.4;
  const current = NAV_ITEMS.find(({ sectionId }) => {
    const section = sectionId && document.getElementById(sectionId);
    if (!section) return false;
    const { top, bottom } = section.getBoundingClientRect();
    return top <= probe && bottom > probe;
  });

  return current?.sectionId ?? "";
}

const getServerSnapshot = () => "top";

function NavItem({ item, className, style, onClick }) {
  const Component = item.route ? Link : "a";
  return (
    <Component href={item.href} className={className} style={style} onClick={onClick}>
      {item.label}
    </Component>
  );
}

function subscribeLocation(callback) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("popstate", callback);
  };
}

// AZ / RU / EN — keeps the visitor on the same page in the chosen language.
function LanguageSwitcher({ locale, label, className = "", itemClassName = "", onNavigate }) {
  // Strip any locale prefix so the server and client render identical links.
  const basePath = stripLocale(usePathname());
  const router = useRouter();

  const suffix = useSyncExternalStore(
    subscribeLocation,
    () => window.location.search + window.location.hash,
    () => "",
  );

  return (
    <nav aria-label={label} className={`flex items-center ${className}`}>
      {locales.map((code) => {
        const current = code === locale;
        return (
          <Link
            key={code}
            href={localizeHref(code, basePath) + suffix}
            scroll={false}
            hrefLang={code}
            lang={code}
            title={localeNames[code]}
            aria-current={current ? "true" : undefined}
            onClick={(event) => {
              // Ctrl/Cmd/Shift/middle clicks keep the browser's open-in-new-tab behaviour.
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
              // Filters may change the query without a popstate event, so read the URL at click time
              // and navigate client-side, keeping the scroll position like the rest of the site.
              event.preventDefault();
              router.push(localizeHref(code, basePath) + window.location.search + window.location.hash, {
                scroll: false,
              });
              onNavigate?.();
            }}
            className={`uppercase transition-opacity duration-300 ${itemClassName} ${
              current
                ? "underline decoration-2 underline-offset-[6px]"
                : "opacity-55 hover:opacity-100"
            }`}
          >
            {code}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * variant "transparent": fixed over the hero, turns light once scrolled.
 * variant "dark": solid dark bar for inner pages, `activePage` highlights an item.
 * Below `lg` the links move into a full-screen menu.
 */
export default function Navbar({ variant = "transparent", activePage }) {
  const { locale, content } = useI18n();
  const t = content.ui.nav;
  const active = useSyncExternalStore(
    subscribe,
    getActiveSection,
    getServerSnapshot,
  );
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dark = variant === "dark";
  const scrolled = !dark && active !== "top";
  const { phoneHref, whatsappHref } = content.contactPage.office;

  const items = NAV_ITEMS.map((item) => ({
    ...item,
    label: t.items[item.id],
    href: localizeHref(locale, item.href),
  }));

  // Lock page scroll and close on Escape while the mobile menu is open.
  useEffect(() => {
    const dialog = menuRef.current;
    if (!menuOpen) { dialog.close(); return; }
    dialog.showModal();
    const focusFrame = requestAnimationFrame(() => dialog.querySelector("button")?.focus());
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    // The dialog is display:none from the lg breakpoint up (lg:hidden). If the viewport grows past
    // it while open (tablet rotation), close it so the page doesn't stay modal with nothing visible.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = (event) => { if (event.matches) setMenuOpen(false); };
    desktop.addEventListener("change", onBreakpoint);

    return () => {
      cancelAnimationFrame(focusFrame);
      dialog.close();
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const isCurrent = (item) =>
    (dark && item.page === activePage) ||
    (scrolled && item.sectionId === active);

  const itemClass = (item) => {
    let color = "text-white/90";
    if (dark && item.page === activePage) color = "text-[#e8e1cd]";
    if (scrolled) {
      color =
        item.sectionId === active ? "text-[#2f6b4a]" : "text-[#1a2a22]";
    }
    return `cursor-pointer whitespace-nowrap text-[clamp(12px,1.05vw,18px)] uppercase tracking-[0.04em] transition-colors duration-300 ${color}`;
  };

  let barClass = "fixed inset-x-0 bg-transparent text-white";
  if (dark) barClass = "sticky bg-[#19241f] text-white";
  if (scrolled) {
    barClass =
      "fixed inset-x-0 bg-[#f3f0e9] text-[#1a2a22] shadow-[0_1px_0_rgba(0,0,0,0.06)]";
  }

  return (
    <>
      <div
        className={`top-0 z-50 flex h-(--nav-h) items-center justify-between gap-6 px-page transition-colors duration-300 ${barClass}`}
      >
        <Link
          href={localizeHref(locale, "/")}
          className="text-[clamp(24px,2.75vw,48px)] font-bold leading-none tracking-tight"
        >
          ÇINARLI
        </Link>

        <nav className="hidden items-center gap-[clamp(18px,2.8vw,64px)] lg:flex">
          {items.map((item) => (
            <NavItem key={item.id} item={item} className={itemClass(item)} />
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-[clamp(16px,1.8vw,36px)] lg:flex">
          <LanguageSwitcher
            locale={locale}
            label={t.language}
            className="gap-[clamp(10px,0.9vw,18px)]"
            itemClassName="text-[clamp(12px,0.95vw,17px)] font-bold tracking-[0.04em]"
          />
          <Link
            href={localizeHref(locale, "/elaqe")}
            className={`inline-block whitespace-nowrap rounded-full px-[clamp(20px,2.7vw,48px)] py-[clamp(10px,1vw,18px)] text-[clamp(12px,1.05vw,18px)] font-bold uppercase tracking-[0.03em] transition-colors duration-300 ${
              scrolled
                ? "bg-[#12271e] text-[#f0ede6]"
                : "bg-[#f1efea] text-[#1c2a22]"
            }`}
          >
            {t.consult}
          </Link>
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <LanguageSwitcher
            locale={locale}
            label={t.language}
            className="gap-3"
            itemClassName="py-3 text-[13px] font-bold tracking-[0.06em]"
          />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
            className="-mr-2 cursor-pointer px-2 py-3 text-[13px] font-bold uppercase tracking-[0.08em]"
          >
            {t.menu}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <dialog
        ref={menuRef}
        onCancel={(event) => { event.preventDefault(); setMenuOpen(false); }}
        onKeyDown={(event) => containDialogTab(event, event.currentTarget)}
        id="mobile-menu"
        aria-modal="true"
        aria-label={t.menuLabel}
        className={`fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 pt-0 z-[60] flex flex-col overflow-y-auto bg-[#13271f] px-page pb-[max(24px,env(safe-area-inset-bottom))] text-white transition-opacity duration-300 ease-butter [&:not([open])]:hidden lg:hidden ${
          menuOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex h-(--nav-h) shrink-0 items-center justify-between">
          <Link
            href={localizeHref(locale, "/")}
            onClick={closeMenu}
            className="text-[24px] font-bold leading-none tracking-tight"
          >
            ÇINARLI
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher
              locale={locale}
              label={t.language}
              className="gap-3"
              itemClassName="py-3 text-[13px] font-bold tracking-[0.06em]"
              onNavigate={closeMenu}
            />
            <button
              type="button"
              onClick={closeMenu}
              className="-mr-2 cursor-pointer px-2 py-3 text-[13px] font-bold uppercase tracking-[0.08em]"
            >
              {t.close}
            </button>
          </div>
        </div>

        <nav className="mt-4 flex flex-col">
          {items.map((item, index) => (
            <NavItem
              key={item.id}
              item={item}
              onClick={closeMenu}
              style={{ transitionDelay: menuOpen ? `${60 + index * 50}ms` : "0ms" }}
              className={`border-b border-white/10 py-4 text-[28px] leading-tight transition-[opacity,translate] duration-500 ease-butter ${
                isCurrent(item) ? "text-[#e8e1cd]" : "text-white"
              } ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            />
          ))}
        </nav>

        <div className="mt-auto grid gap-3 pt-8">
          <Link
            href={localizeHref(locale, "/elaqe")}
            onClick={closeMenu}
            className="flex h-13 items-center justify-center rounded-full bg-[#ebe3c6] text-[13px] font-bold uppercase tracking-[0.04em] text-[#16201b]"
          >
            {t.consult}
          </Link>
          <div className="grid grid-cols-2 gap-3">
            {phoneHref && (<a
              href={phoneHref}
              className="flex h-12 items-center justify-center rounded-full border border-white/30 text-[13px] uppercase tracking-[0.04em]"
            >
              {t.call}
            </a>)}
            {whatsappHref && (<a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center rounded-full bg-[#24573f] text-[13px] uppercase tracking-[0.04em]"
            >
              WhatsApp
            </a>)}
          </div>
        </div>
      </dialog>
    </>
  );
}
