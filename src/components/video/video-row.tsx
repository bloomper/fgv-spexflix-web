import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { RowScroller } from "@/components/video/row-scroller.client";
import { VideoCard } from "@/components/video/video-card.client";
import type { VideoSummary } from "@/components/video/video-grid";

export type RowVideo = VideoSummary & {
  inWatchList?: boolean;
  spex?: (NonNullable<VideoSummary["spex"]>[number] & { familyId?: string })[];
};

/**
 * The title page a card's "more info" opens: the main spex's, else the video's own page.
 */
export function infoHrefOf(video: RowVideo): string {
  const familyId = video.spex?.[0]?.familyId;

  return familyId ? `/spex/${familyId}` : `/videos/${video.id}`;
}

/**
 * A row of the start page: a heading, a link to everything of its kind, and its videos as cards that scroll
 * sideways. A row without videos is not shown.
 */
export function VideoRow({
  id,
  title,
  more,
  videos,
  action,
  label,
}: {
  id: string;
  title: string;
  more?: { href: string; label: string };
  videos: RowVideo[];
  action?: (video: RowVideo) => ReactNode;
  label?: (video: RowVideo) => ReactNode;
}) {
  if (videos.length === 0) {
    return null;
  }
  return (
    <section
      aria-labelledby={id}
      className="relative focus-within:z-10 hover:z-10"
    >
      <div className="flex items-baseline gap-3 px-4 md:px-10">
        <h2
          id={id}
          className="text-lg font-semibold md:text-xl"
        >
          {title}
        </h2>
        {more && (
          <Link
            href={more.href}
            className="text-link hover:text-link/80 inline-flex items-center text-sm"
          >
            {more.label}
            <ChevronRight
              className="size-4"
              aria-hidden
            />
          </Link>
        )}
      </div>
      <RowScroller label={title}>
        {videos.map((video) => (
          <li
            key={video.id}
            className="w-[44vw] shrink-0 snap-start sm:w-56 lg:w-64 2xl:w-72"
          >
            <VideoCard
              video={video}
              infoHref={infoHrefOf(video)}
              action={action?.(video)}
              label={label?.(video)}
            />
          </li>
        ))}
      </RowScroller>
    </section>
  );
}
