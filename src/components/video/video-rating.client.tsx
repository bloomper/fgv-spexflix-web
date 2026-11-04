"use client";

import * as React from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AverageRating, RatingInput } from "@/components/rating.client";
import { rateVideoAction } from "@/components/video/actions.server";
import { track } from "@/utils/umami";
import { useServerState } from "@/hooks/use-server-state.client";

/**
 * The user's rating of a video, changed at once and taken back when it cannot be saved, and everyone's average.
 */
export function VideoRating({ videoId, rating: initialRating, averageRating, ratingCount, likeCount = 0 }: {
  videoId: string;
  rating: number;
  averageRating?: number | null;
  ratingCount: number;
  likeCount?: number;
}) {
  const t = useTranslations("Watch");
  const [rating, setRating] = useServerState(initialRating);
  const [, startTransition] = useTransition();

  const rate = (next: number) => {
    const previous = rating;

    setRating(next);
    startTransition(async () => {
      if (await rateVideoAction(videoId, next)) {
        track("video-rate", { rating: next });
      } else {
        setRating(previous);
        toast.error(t("rateFailed"));
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <RatingInput value={rating} onChange={rate} label={t("rate")} />
      {averageRating && ratingCount > 0
        ? <AverageRating average={averageRating} count={ratingCount} stars className="text-sm" />
        : <span className="text-sm text-muted-foreground">{t("noRatings")}</span>}
      {likeCount > 0 && <span className="text-sm text-muted-foreground">{t("likes", { count: likeCount })}</span>}
    </div>
  );
}
