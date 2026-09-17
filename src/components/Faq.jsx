"use client";

import { useId, useRef, useState } from "react";

// Accordion: only one answer is open at a time.
// Pressing + opens an answer and keeps it open; pressing × closes it. With a mouse, moving over a
// question also opens it, and an answer opened that way closes when the pointer leaves the list.
// Hover reacts to real pointer movement only: when an answer closes, the questions shift under a
// resting pointer, and opening whatever lands there would chain into more shifts.
export default function Faq({ title, items }) {
  const [open, setOpen] = useState({ index: null, pinned: false });
  const lastPointer = useRef(null);
  // A question closed by click stays closed until the pointer leaves it.
  const closedByClick = useRef(null);
  const baseId = useId();

  const hoverOpen = (event, index) => {
    if (event.pointerType !== "mouse") return;
    const moved =
      lastPointer.current?.x !== event.clientX || lastPointer.current?.y !== event.clientY;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    if (!moved || index === open.index || index === closedByClick.current) return;
    setOpen({ index, pinned: false });
  };

  return (
    <div>
      <h2 className="text-[clamp(20px,1.8vw,36px)] leading-tight max-md:text-[24px]">{title}</h2>

      <ul
        onPointerLeave={() => {
          lastPointer.current = null;
          setOpen((current) => (current.pinned ? current : { index: null, pinned: false }));
        }}
        className="mt-[clamp(20px,2.2vw,44px)] space-y-[clamp(12px,1.4vw,28px)]"
      >
        {items.map((item, index) => {
          const isOpen = index === open.index;
          const buttonId = `${baseId}-question-${index}`;
          const panelId = `${baseId}-answer-${index}`;

          return (
            <li
              key={item.question}
              onPointerMove={(event) => hoverOpen(event, index)}
              onPointerLeave={() => {
                if (closedByClick.current === index) closedByClick.current = null;
              }}
              className="rounded-[clamp(14px,1.5vw,30px)] bg-white max-md:rounded-[20px]"
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => {
                    if (isOpen) {
                      closedByClick.current = index;
                      setOpen({ index: null, pinned: false });
                    } else {
                      closedByClick.current = null;
                      setOpen({ index, pinned: true });
                    }
                  }}
                  className="flex min-h-[clamp(60px,5.4vw,108px)] w-full cursor-pointer items-center justify-between gap-6 py-4 pl-[clamp(20px,2.4vw,48px)] pr-[clamp(20px,2.8vw,56px)] text-left text-[clamp(14px,1.1vw,21px)] max-md:min-h-16 max-md:gap-4 max-md:text-[15px] max-md:leading-snug"
                >
                  <span>{item.question}</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className={`size-[clamp(14px,1.2vw,24px)] shrink-0 max-md:size-4 text-[#2a5a40] transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <path
                      d="M8 1v14M1 8h14"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                inert={!isOpen}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="pb-[clamp(20px,2.2vw,44px)] pl-[clamp(20px,2.4vw,48px)] pr-[clamp(20px,5.2vw,104px)] text-[clamp(13px,1vw,19px)] leading-[1.7] text-[#6c6b65] max-md:text-[14px] max-md:leading-[1.65]">
                    {item.answer}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
