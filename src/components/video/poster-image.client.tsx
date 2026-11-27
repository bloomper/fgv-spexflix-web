"use client";

import { useCallback, useState } from "react";
import { Film } from "lucide-react";
import { cn } from "@/utils/utils";

/**
 * A video's poster from {@code /api/poster/[id]}; a film icon when it has none.
 */
export function PosterImage({ videoId, title, className }: { videoId: string; title: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  // An image that failed before React hydrated never fires onError, so a broken one is caught when it mounts
  const checkLoaded = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  if (failed) {
    return (
      <div
        className={cn("bg-muted text-muted-foreground flex aspect-video items-center justify-center", className)}
        role="img"
        aria-label={title}
      >
        <Film className="size-1/4" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/poster/${videoId}`}
      alt={title}
      loading="lazy"
      ref={checkLoaded}
      onError={() => setFailed(true)}
      className={cn("aspect-video object-cover", className)}
    />
  );
}
