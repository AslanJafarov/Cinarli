import Link from "next/link";

const icons = {
  // Apartment building
  building: (
    <>
      <path d="M9 42V10.5a2 2 0 0 1 1.3-1.9l14-5.1a2 2 0 0 1 2.7 1.9V42" />
      <path d="M27 17h10a2 2 0 0 1 2 2v23M4 42h40" />
      <path d="M15 14h2M20 14h2M15 21h2M20 21h2M15 28h2M20 28h2M32 24h2M32 31h2M17 42v-6h4v6" />
    </>
  ),
  // Newspaper
  news: (
    <>
      <path d="M9 8h28a2 2 0 0 1 2 2v28a3 3 0 0 0 3 3H12a3 3 0 0 1-3-3z" />
      <path d="M39 18h4v20a3 3 0 0 1-3 3M15 16h18M15 23h18M15 30h11" />
    </>
  ),
  // Photo frame
  photo: (
    <>
      <rect x="5" y="9" width="38" height="30" rx="4" />
      <circle cx="16" cy="19" r="3.5" />
      <path d="m5 34 10.6-9.4a2 2 0 0 1 2.7 0l6.2 5.6 5.7-5.1a2 2 0 0 1 2.7 0L43 34" />
    </>
  ),
};

/**
 * Shown where apartments or photos would be while the admin panel has none published.
 * `actions`: [{ href, label, primary?, external? }]
 */
export default function EmptyNotice({ icon = "building", title, text, actions = [], className = "" }) {
  return (
    <div
      className={`relative flex flex-col items-center overflow-hidden rounded-[clamp(18px,2vw,40px)] bg-white px-6 py-[clamp(48px,6vw,112px)] text-center text-[#16201b] ${className}`}
    >
      {/* Soft rings behind the icon */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[clamp(10px,2vw,40px)] size-[clamp(220px,20vw,380px)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#e7eee9_0%,#e7eee9_34%,transparent_35%,transparent_52%,#f1f4f2_53%,#f1f4f2_60%,transparent_61%)]"
      />

      <span className="relative grid size-[clamp(64px,5.2vw,100px)] place-items-center rounded-full bg-[#24503a] text-white shadow-[0_12px_30px_rgba(36,80,58,0.25)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[48%]"
        >
          {icons[icon]}
        </svg>
      </span>

      <h2 className="relative mt-[clamp(20px,2.2vw,44px)] max-w-[22em] text-balance text-[clamp(22px,2.2vw,42px)] font-bold leading-[1.15]">
        {title}
      </h2>
      <p className="relative mt-[clamp(8px,0.9vw,18px)] max-w-[34em] text-balance text-[clamp(14px,1.1vw,21px)] leading-[1.5] text-[#6c6b65]">
        {text}
      </p>

      {actions.length > 0 && (
        <div className="relative mt-[clamp(24px,2.4vw,48px)] flex flex-wrap justify-center gap-3 max-sm:w-full max-sm:flex-col">
          {actions.map((action) => {
            const className = `inline-flex h-[clamp(46px,3.6vw,68px)] items-center justify-center rounded-full px-[clamp(24px,2.4vw,46px)] text-[clamp(13px,0.95vw,18px)] font-bold uppercase tracking-[0.04em] transition-colors ${
              action.primary
                ? "bg-[#19241f] text-white hover:bg-[#24503a]"
                : "border-2 border-[#24503a]/25 text-[#24503a] hover:border-[#24503a] hover:bg-[#24503a]/5"
            }`;
            return action.external ? (
              <a key={action.label} href={action.href} className={className}>
                {action.label}
              </a>
            ) : (
              <Link key={action.label} href={action.href} className={className}>
                {action.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
