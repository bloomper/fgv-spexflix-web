import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { PosterImage } from "@/components/video/poster-image.client";
import type { RowVideo } from "@/components/video/video-row";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { formatDuration } from "@/utils/duration";
import { kindName } from "@/utils/format";
import { watchedFraction } from "@/utils/rows";

/**
 * A title's videos as a list of episodes: number, still, title, kind, length, how far the user has come and the
 * description.
 */
export function EpisodeList({ videos, label, numbered = true }: {
  videos: (RowVideo & { description?: string | null })[];
  label: string;
  numbered?: boolean;
}) {
  const t = useTranslations("Card");
  const tv = useTranslations("Video");
  const locale = useLocale();

  return (
    <ol aria-label={label} className="divide-y divide-border/60">
      {videos.map((video, i) => {
        const duration = (video.durationMs ?? 0) / 1000;
        const watched = watchedFraction(video);

        return (
          <li key={video.id}>
            <Link href={`/videos/${video.id}?autoplay=1`}
                  className="group flex items-center gap-3 rounded-md p-2 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring sm:gap-4 sm:p-3">
              {numbered && <span className="hidden w-6 shrink-0 text-center text-xl text-muted-foreground tabular-nums sm:block">{i + 1}</span>}
              <span className="relative w-32 shrink-0 overflow-hidden rounded-md sm:w-44">
                <PosterImage videoId={video.id} title={video.title} className="w-full" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Play className="size-8 fill-white text-white" aria-hidden />
                </span>
                {watched > 0 && (
                  <span className="absolute inset-x-0 bottom-0 h-1 bg-white/30"
                        aria-label={t("watched", { percent: Math.round(watched * 100) })}>
                    <span className="block h-full bg-primary" style={{ width: `${watched * 100}%` }} />
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1 space-y-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-medium">{video.title}</span>
                  {duration > 0 && <span className="shrink-0 text-sm text-muted-foreground tabular-nums">{formatDuration(duration)}</span>}
                </span>
                <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {[kindName(video.kind, locale), video.year].filter(Boolean).join(" · ")}
                  {video.spex?.[0]?.revival && <Badge variant="secondary">{tv("revival")}</Badge>}
                  {video.finished && <Badge variant="secondary">{tv("seen")}</Badge>}
                </span>
                {video.description && <span className="line-clamp-2 text-sm text-muted-foreground">{video.description}</span>}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
