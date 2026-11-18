import type { ReactNode } from "react";
import { PosterImage } from "@/components/video/poster-image.client";
import { cn } from "@/utils/utils";

/**
 * A full-width backdrop: a video's poster or still, darkened towards the page so that text on it can be read, with
 * the content at its lower left.
 */
export function Backdrop({ videoId, title, children, className }: {
  videoId?: string | null;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative isolate flex min-h-[56vw] items-end overflow-hidden sm:min-h-[42vw] lg:min-h-[34rem]", className)}>
      {videoId && (
        <PosterImage videoId={videoId} title="" className="absolute inset-0 -z-10 h-full w-full" />
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-background/30" />
      <div className="w-full max-w-3xl space-y-3 px-4 pt-24 pb-6 md:px-10 md:pb-10" aria-label={title} role="group">
        {children}
      </div>
    </div>
  );
}
