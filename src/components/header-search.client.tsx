"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { buttonVariants } from "@bloomper/fgv-web-ui/ui/button";
import { Input } from "@bloomper/fgv-web-ui/ui/input";
import { type SearchHit, searchPreviewAction } from "@/components/video/actions.server";

/** How long typing pauses before the field looks for videos. */
const DEBOUNCE = 250;

/**
 * Search across videos, spex, descriptions, performances and chapters. The field shows the first videos found as the
 * viewer types; Enter opens the search page with every result. On a phone the header has no room for the field next
 * to the application's name, so it is a button to the search page, which has a field of its own.
 */
export function HeaderSearch() {
  const t = useTranslations("Search");
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [text, setText] = useState(q);
  const [hits, setHits] = useState<{ q: string; videos: SearchHit[] } | null>(null);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLFormElement>(null);
  const listId = useId();
  const typed = text.trim();

  // Keyed by the address' query, so that the field follows a search made on the search page itself
  const [seen, setSeen] = useState(q);

  if (seen !== q) {
    setSeen(q);
    setText(q);
  }

  useEffect(() => {
    if (typed.length < 2) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      void searchPreviewAction(typed).then(videos => {
        if (!cancelled) {
          setHits({ q: typed, videos });
        }
      });
    }, DEBOUNCE);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [typed]);

  const shown = open && typed.length >= 2 && hits?.q === typed;
  const all = `/search?q=${encodeURIComponent(typed)}`;

  return (
    <>
      <Link href="/search" aria-label={t("title")} title={t("title")}
            className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 sm:hidden" })}>
        <Search />
      </Link>
      <form ref={box} role="search" className="relative hidden sm:block"
            onFocus={() => setOpen(true)}
            onBlur={event => {
              if (!box.current?.contains(event.relatedTarget as Node | null)) {
                setOpen(false);
              }
            }}
            onKeyDown={event => {
              if (event.key === "Escape") {
                setOpen(false);
              }
            }}
            onSubmit={event => {
              event.preventDefault();
              setOpen(false);
              router.push(typed ? all : "/search");
            }}>
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" type="search" value={text} placeholder={t("placeholder")} autoComplete="off"
               aria-label={t("placeholder")} aria-controls={shown ? listId : undefined} aria-expanded={shown}
               onChange={event => {
                 setText(event.target.value);
                 setOpen(true);
               }}
               className="h-8 w-48 pl-8 md:w-64" />
        {shown && hits && (
          <div id={listId} role="region" aria-label={t("quickResults")}
               className="absolute top-full right-0 z-50 mt-1 w-80 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg">
            {hits.videos.length === 0
              ? <p className="px-3 py-2 text-sm text-muted-foreground">{t("none")}</p>
              : (
                <ul>
                  {hits.videos.map(video => (
                    <li key={video.id}>
                      <Link href={`/videos/${video.id}`} onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-2 py-1.5 text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/api/poster/${video.id}`} alt="" className="aspect-video w-16 shrink-0 rounded bg-muted object-cover" />
                        <span className="min-w-0 flex-1 truncate">{video.title}</span>
                        {video.year && <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{video.year}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            <Link href={all} onClick={() => setOpen(false)}
                  className="block border-t px-3 py-2 text-sm text-link hover:bg-accent focus-visible:bg-accent focus-visible:outline-none">
              {t("allResults", { q: typed })}
            </Link>
          </div>
        )}
      </form>
    </>
  );
}
