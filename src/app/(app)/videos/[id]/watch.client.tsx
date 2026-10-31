"use client";

import {useRef, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Bookmark, BookmarkCheck, Music} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {type PlayerHandle, VideoPlayer} from "@/components/video/video-player.client";
import {watchListAction} from "@/components/video/actions.server";
import {formatDuration} from "@/utils/duration";

type Chapter = { startSeconds: number; title: string; spexifyTrackId?: string | null; spexifyTrackTitle?: string | null };

/**
 * The player with its chapter list beside it: a chapter jumps there, and a chapter linked to a track links to Spexify.
 */
export function Watch({videoId, playback, chapters, durationSeconds, startAt, inWatchList, spexifyUrl, recordProgress}: {
    videoId: string;
    playback: { masterUrl: string; thumbnailsUrl?: string | null; subtitles: { language: string; label: string; url: string }[] };
    chapters: Chapter[];
    durationSeconds: number;
    startAt: number | null;
    inWatchList: boolean;
    spexifyUrl: string | null;
    recordProgress: boolean;
}) {
    const t = useTranslations("Watch");
    const player = useRef<PlayerHandle>(null);
    const [listed, setListed] = useState(inWatchList);
    const [pending, startTransition] = useTransition();

    return (
        <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
            <div className="space-y-3">
                <VideoPlayer ref={player} videoId={videoId} masterUrl={playback.masterUrl} thumbnailsUrl={playback.thumbnailsUrl}
                             subtitles={playback.subtitles} chapters={chapters} durationSeconds={durationSeconds} startAt={startAt}
                             recordProgress={recordProgress}/>
                <Button variant="outline" disabled={pending} aria-pressed={listed} onClick={() => startTransition(async () => {
                    if (await watchListAction(videoId, !listed)) {
                        setListed(!listed);
                    } else {
                        toast.error(t("watchListFailed"));
                    }
                })}>
                    {listed ? <BookmarkCheck/> : <Bookmark/>}{listed ? t("inWatchList") : t("addToWatchList")}
                </Button>
            </div>
            {chapters.length > 0 && (
                <section aria-labelledby="chapters" className="space-y-2">
                    <h2 id="chapters" className="font-semibold">{t("chapters")}</h2>
                    <ol className="divide-y rounded-lg border">
                        {chapters.map(chapter => (
                            <li key={chapter.startSeconds} className="flex items-center gap-2 px-3 py-2">
                                <button type="button" className="flex min-w-0 flex-1 items-baseline gap-3 text-left hover:underline"
                                        onClick={() => player.current?.seek(chapter.startSeconds)}>
                                    <span className="w-14 shrink-0 text-xs tabular-nums text-muted-foreground">{formatDuration(chapter.startSeconds)}</span>
                                    <span className="truncate text-sm">{chapter.title}</span>
                                </button>
                                {spexifyUrl && chapter.spexifyTrackId && (
                                    <a href={`${spexifyUrl}/search?q=${encodeURIComponent(chapter.spexifyTrackTitle ?? chapter.title)}`}
                                       target="_blank" rel="noopener noreferrer"
                                       className="inline-flex shrink-0 items-center gap-1 text-xs text-primary hover:underline"
                                       aria-label={t("listenInSpexify", {title: chapter.title})}>
                                        <Music className="size-3.5"/>{t("listen")}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ol>
                </section>
            )}
        </div>
    );
}
