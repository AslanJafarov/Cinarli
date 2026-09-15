export const inputClass =
  "block w-full rounded-xl border border-[#16201b]/12 bg-white px-3.5 py-2.5 text-sm text-[#16201b] outline-none max-md:text-base transition placeholder:text-[#a4a39b] focus:border-[#24503a] focus:ring-2 focus:ring-[#24503a]/15";

export const labelClass = "mb-1.5 block text-xs font-semibold text-[#6b6a63]";

const buttonBase =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

export const buttonClass = {
  primary: `${buttonBase} h-10 max-md:h-11 bg-[#13271f] px-5 text-white hover:bg-[#1f3d30]`,
  secondary: `${buttonBase} h-10 max-md:h-11 border border-[#16201b]/15 bg-white px-4 text-[#16201b] hover:border-[#16201b]/35`,
  danger: `${buttonBase} h-10 max-md:h-11 bg-[#9b2f22] px-4 text-white hover:bg-[#832619]`,
  ghost: `${buttonBase} h-10 max-md:h-11 px-3 text-[#6b6a63] hover:text-[#16201b]`,
  add: `${buttonBase} border border-dashed border-[#24503a]/45 px-3.5 py-2 text-[#24503a] hover:border-[#24503a] hover:bg-[#24503a]/5`,
};

const iconPaths = {
  up: "M4 10l4-4 4 4",
  down: "M4 6l4 4 4-4",
  left: "M10 4 6 8l4 4",
  right: "M6 4l4 4-4 4",
  chevron: "M6 4l4 4-4 4",
  plus: "M8 3v10M3 8h10",
  close: "M4 4l8 8M12 4l-8 8",
  copy: "M5.5 5.5h7v7h-7zM3.5 10.5v-7h7",
  trash: "M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5",
  upload: "M8 10.5V3M4.8 6.2 8 3l3.2 3.2M3 13h10",
  info: "M8 7.2V11M8 5h.01M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z",
  search: "M7 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM14 14l-3.5-3.5",
  download: "M8 3v7.5M4.8 7.3 8 10.5l3.2-3.2M3 13h10",
};

export function Icon({ name, className = "size-4" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export function IconButton({ label, icon, onClick, disabled = false, danger = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid size-8 shrink-0 max-md:size-9 cursor-pointer place-items-center rounded-lg text-[#77766f] transition disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "hover:bg-[#9b2f22]/10 hover:text-[#9b2f22]"
          : "hover:bg-[#16201b]/6 hover:text-[#16201b]"
      }`}
    >
      <Icon name={icon} />
    </button>
  );
}
