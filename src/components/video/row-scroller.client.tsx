"use client";

import { type ReactNode, useRef } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * A row of cards that scrolls sideways, by swiping or with the arrows at its ends, which show on hover.
 */
export function RowScroller({ label, children }: { label: string; children: ReactNode }) {
  const t = useTranslations("Card");
  const list = useRef<HTMLUListElement>(null);
  const scroll = (direction: 1 | -1) => {
    const element = list.current;

    element?.scrollBy({ left: direction * element.clientWidth * 0.85, behavior: "smooth" });
  };
  const arrow =
    "absolute inset-y-4 z-30 hidden w-8 items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100 md:flex md:w-10";

  return (
    <div className="group/row relative">
      <button
        type="button"
        className={`${arrow} left-0`}
        aria-label={t("scrollBack", { row: label })}
        onClick={() => scroll(-1)}
      >
        <ChevronLeft className="size-6" />
      </button>
      <ul
        ref={list}
        aria-label={label}
        className="-mb-16 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-2 overflow-x-auto px-4 pt-4 pb-20 md:scroll-px-10 md:gap-3 md:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      <button
        type="button"
        className={`${arrow} right-0`}
        aria-label={t("scrollForward", { row: label })}
        onClick={() => scroll(1)}
      >
        <ChevronRight className="size-6" />
      </button>
    </div>
  );
}
