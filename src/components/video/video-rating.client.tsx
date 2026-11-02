"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {toast} from "sonner";
import {RatingInput} from "@/components/rating.client";
import {rateVideoAction} from "@/components/video/actions.server";
import {track} from "@/utils/umami";

/**
 * The user's rating of a video, changed at once and taken back when it cannot be saved, and everyone's average.
 */
export function VideoRating({videoId, rating: initialRating, averageRating, ratingCount}: {
    videoId: string;
    rating: number;
    averageRating?: number | null;
    ratingCount: number;
}) {
    const t = useTranslations("Watch");
    const locale = useLocale();
    const decimal = new Intl.NumberFormat(locale === "en" ? "en" : "sv", {minimumFractionDigits: 1, maximumFractionDigits: 1});
    const [rating, setRating] = useState(initialRating);
    const [, startTransition] = useTransition();

    const rate = (next: number) => {
        const previous = rating;

        setRating(next);
        startTransition(async () => {
            if (await rateVideoAction(videoId, next)) {
                track("video-rate", {rating: next});
            } else {
                setRating(previous);
                toast.error(t("rateFailed"));
            }
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <RatingInput value={rating} onChange={rate} label={t("rate")}/>
            <span className="text-sm text-muted-foreground">
                {averageRating && ratingCount > 0
                    ? t("average", {average: decimal.format(averageRating), count: ratingCount})
                    : t("noRatings")}
            </span>
        </div>
    );
}
