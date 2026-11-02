import type {ReactNode} from "react";
import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";
import {PosterImage} from "@/components/video/poster-image.client";
import {formatDuration} from "@/utils/duration";
import {type KindName, kindName} from "@/utils/format";

export type VideoSummary = {
    id: string;
    title: string;
    year?: number | null;
    kind: KindName;
    durationMs?: number | null;
    status?: string;
    published?: boolean;
    progressSeconds?: number | null;
    finished?: boolean;
    /** The main spex first. */
    spex?: { categoryName?: string | null; revival?: boolean | null }[];
};

/**
 * Videos as poster cards, with how far the user has come.
 */
export function VideoGrid({videos, hrefFor, action}: {
    videos: VideoSummary[];
    hrefFor?: (id: string) => string;
    /** Something to do with a video, shown on its card's corner, e.g. taking it off "continue watching". */
    action?: (video: VideoSummary) => ReactNode;
}) {
    const t = useTranslations("Video");
    const locale = useLocale();

    return (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {videos.map(video => {
                const duration = (video.durationMs ?? 0) / 1000;
                const watched = video.finished ? 1 : duration > 0 && video.progressSeconds ? Math.min(1, video.progressSeconds / duration) : 0;

                return (
                    <li key={video.id} className="relative">
                        {action && <div className="absolute top-2 right-2 z-10">{action(video)}</div>}
                        <Link href={hrefFor ? hrefFor(video.id) : `/videos/${video.id}`}
                              className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <div className="relative overflow-hidden rounded-lg shadow-sm">
                                <PosterImage videoId={video.id} title={video.title}
                                             className="w-full transition-transform group-hover:scale-[1.02]"/>
                                {duration > 0 && (
                                    <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-xs text-white tabular-nums">
                                        {formatDuration(duration)}
                                    </span>
                                )}
                                {watched > 0 && (
                                    <span className="absolute inset-x-0 bottom-0 h-1 bg-black/40" aria-label={t("watched", {percent: Math.round(watched * 100)})}>
                                        <span className="block h-full bg-primary" style={{width: `${watched * 100}%`}}/>
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 space-y-0.5">
                                <div className="line-clamp-2 font-medium leading-tight">{video.title}</div>
                                <div className="text-xs text-muted-foreground">
                                    {[video.year, video.spex?.[0]?.categoryName, kindName(video.kind, locale)].filter(Boolean).join(" · ")}
                                </div>
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                    {video.spex?.[0]?.revival && <Badge variant="secondary">{t("revival")}</Badge>}
                                    {video.published === false && <Badge variant="outline">{t("unpublished")}</Badge>}
                                    {video.status && video.status !== "READY" && <Badge variant={video.status === "FAILED" ? "destructive" : "secondary"}>{t(`status.${video.status}`)}</Badge>}
                                    {video.finished && <Badge variant="secondary">{t("seen")}</Badge>}
                                </div>
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
