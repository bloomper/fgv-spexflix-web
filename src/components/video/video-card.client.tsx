"use client";

import { type ReactNode, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Check, Info, Play, Plus } from "lucide-react";
import { toast } from "sonner";
import { PosterImage } from "@/components/video/poster-image.client";
import { AverageRating } from "@/components/rating.client";
import { watchListAction } from "@/components/video/actions.server";
import type { VideoSummary } from "@/components/video/video-grid";
import { useServerState } from "@/hooks/use-server-state.client";
import { formatDuration } from "@/utils/duration";
import { kindName } from "@/utils/format";
import { watchedFraction } from "@/utils/rows";
import { track } from "@/utils/umami";
import { cn } from "@/utils/utils";

/** How long a finger rests on a card before it grows, as a hover would. */
const LONG_PRESS = 500;

/**
 * A video as a 16:9 still in a row. On hover, keyboard focus or a long press on a phone it grows and shows the title,
 * year, kind, length, everyone's rating, how far the user has come and buttons to play, to save it in the watch list
 * and for more about it.
 */
export function VideoCard({ video, infoHref, action, label }: {
  video: VideoSummary & { inWatchList?: boolean };
  /** The title page: the spex, else the video itself. */
  infoHref: string;
  /** Something to do with the video on the card's corner, e.g. taking it off "continue watching". */
  action?: ReactNode;
  /** An extra line, e.g. the user's own rating. */
  label?: ReactNode;
}) {
  const t = useTranslations("Card");
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [listed, setListed] = useServerState(video.inWatchList ?? false);
  const [pending, startTransition] = useTransition();
  const card = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressed = useRef(false);
  const duration = (video.durationMs ?? 0) / 1000;
  const watched = watchedFraction(video);

  // A tap elsewhere puts a card grown by a long press back
  useEffect(() => {
    if (!expanded) {
      return;
    }

    const collapse = (event: PointerEvent) => {
      if (!card.current?.contains(event.target as Node)) {
        setExpanded(false);
      }
    };

    document.addEventListener("pointerdown", collapse);
    return () => document.removeEventListener("pointerdown", collapse);
  }, [expanded]);

  useEffect(() => () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  }, []);

  const cancelPress = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return (
    <div ref={card} data-expanded={expanded || undefined}
         className="group/card relative transition-transform duration-200 ease-out hover:z-20 hover:scale-110 focus-within:z-20 focus-within:scale-110 data-expanded:z-20 data-expanded:scale-110"
         onTouchStart={() => {
           pressed.current = false;
           cancelPress();
           timer.current = setTimeout(() => {
             pressed.current = true;
             setExpanded(true);
           }, LONG_PRESS);
         }}
         onTouchEnd={cancelPress} onTouchMove={cancelPress}
         onContextMenu={event => expanded && event.preventDefault()}>
      {action && <div className="absolute top-1.5 right-1.5 z-10">{action}</div>}
      <Link href={`/videos/${video.id}`}
            className="block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={event => {
              // The long press grew the card; lifting the finger is not a tap on it
              if (pressed.current) {
                event.preventDefault();
                pressed.current = false;
              }
            }}>
        <div className="relative overflow-hidden rounded-md bg-muted shadow-md">
          <PosterImage videoId={video.id} title={video.title} className="w-full" />
          {duration > 0 && (
            <span className="absolute right-1.5 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-xs text-white tabular-nums transition-opacity group-hover/card:opacity-0 group-focus-within/card:opacity-0 group-data-expanded/card:opacity-0">
              {formatDuration(duration)}
            </span>
          )}
          {watched > 0 && (
            <span className="absolute inset-x-0 bottom-0 h-1 bg-white/30"
                  aria-label={t("watched", { percent: Math.round(watched * 100) })}>
              <span className="block h-full bg-primary" style={{ width: `${watched * 100}%` }} />
            </span>
          )}
        </div>
        <div className="mt-1.5 truncate text-sm font-medium">{video.title}</div>
      </Link>

      {/* What the card shows when it grows */}
      <div className="pointer-events-none absolute inset-x-0 top-full z-20 -mt-6 rounded-b-md bg-popover p-2.5 text-popover-foreground opacity-0 shadow-xl transition-opacity duration-200 group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-focus-within/card:pointer-events-auto group-focus-within/card:opacity-100 group-data-expanded/card:pointer-events-auto group-data-expanded/card:opacity-100">
        <div className="flex items-center gap-1.5">
          <Link href={`/videos/${video.id}?autoplay=1`} aria-label={t("play")} title={t("play")}
                className="flex size-8 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80">
            <Play className="size-4 fill-current" />
          </Link>
          <button type="button" disabled={pending} aria-pressed={listed}
                  aria-label={t("myList")} title={listed ? t("inMyList") : t("addToMyList")}
                  className={cn("flex size-8 items-center justify-center rounded-full border-2 border-foreground/40 hover:border-foreground",
                    listed && "border-primary text-primary")}
                  onClick={() => startTransition(async () => {
                    const value = !listed;

                    setListed(value);
                    if (await watchListAction(video.id, value)) {
                      track("watch-list", { listed: value });
                    } else {
                      setListed(!value);
                      toast.error(t("myListFailed"));
                    }
                  })}>
            {listed ? <Check className="size-4" /> : <Plus className="size-4" />}
          </button>
          <span className="flex-1" />
          <Link href={infoHref} aria-label={t("moreInfo")} title={t("moreInfo")}
                className="flex size-8 items-center justify-center rounded-full border-2 border-foreground/40 hover:border-foreground">
            <Info className="size-4" />
          </Link>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {[video.year, kindName(video.kind, locale), duration > 0 ? formatDuration(duration) : null].filter(Boolean).join(" · ")}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <AverageRating average={video.averageRating} count={video.ratingCount} />
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
        </div>
      </div>
    </div>
  );
}
