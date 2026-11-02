"use client";

import {useCallback, useEffect, useRef, useState, useTransition} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {Bookmark, BookmarkCheck, Eye, EyeOff, Music, Play, X} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {type PlayerHandle, VideoPlayer} from "@/components/video/video-player.client";
import {setWatchedAction, watchListAction} from "@/components/video/actions.server";
import {formatDuration} from "@/utils/duration";
import {cn} from "@/utils/utils";
import {track} from "@/utils/umami";

type Chapter = { startSeconds: number; title: string; spexifyTrackId?: string | null; spexifyTrackTitle?: string | null };

const AUTOPLAY_KEY = "spexflix.autoplay";
const COUNTDOWN = 10;

function readAutoplay(): boolean {
    try {
        return localStorage.getItem(AUTOPLAY_KEY) !== "false";
    } catch {
        return true;
    }
}

/**
 * The player with its chapter list beside it: a chapter jumps there, the playing one is marked, and a chapter linked to a
 * track links to Spexify. When the video ends and another follows it (in a collection, or of the same spex), that one
 * starts after a countdown unless the viewer turned it off.
 */
export function Watch({videoId, playback, chapters, durationSeconds, startAt, inWatchList, finished, spexifyUrl, recordProgress, next, autoPlay}: {
    videoId: string;
    playback: { masterUrl: string; thumbnailsUrl?: string | null; subtitles: { language: string; label: string; url: string }[] };
    chapters: Chapter[];
    durationSeconds: number;
    startAt: number | null;
    inWatchList: boolean;
    finished: boolean;
    spexifyUrl: string | null;
    recordProgress: boolean;
    next: { id: string; title: string } | null;
    autoPlay: boolean;
}) {
    const t = useTranslations("Watch");
    const router = useRouter();
    const player = useRef<PlayerHandle>(null);
    const [listed, setListed] = useState(inWatchList);
    const [watched, setWatched] = useState(finished);
    const [pending, startTransition] = useTransition();
    const [time, setTime] = useState(startAt ?? 0);
    const [autoplayNext, setAutoplayNext] = useState(() => typeof window === "undefined" ? true : readAutoplay());
    const [countdown, setCountdown] = useState<number | null>(null);
    const playing = chapters.filter(chapter => chapter.startSeconds <= time).at(-1);

    const playNext = useCallback(() => {
        if (next) {
            setCountdown(null);
            track("video-next", {automatic: false});
            router.push(`/videos/${next.id}?autoplay=1`);
        }
    }, [next, router]);

    useEffect(() => {
        if (countdown === null || !next) {
            return;
        }

        const timer = setTimeout(() => {
            if (countdown <= 1) {
                setCountdown(null);
                track("video-next", {automatic: true});
                router.push(`/videos/${next.id}?autoplay=1`);
            } else {
                setCountdown(countdown - 1);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, next, router]);

    const onEnded = useCallback(() => {
        setWatched(true);
        if (next && autoplayNext) {
            setCountdown(COUNTDOWN);
        }
    }, [autoplayNext, next]);

    const onTime = useCallback((seconds: number) => {
        setTime(seconds);
        setCountdown(current => current !== null && seconds < durationSeconds - 1 ? null : current);
    }, [durationSeconds]);

    return (
        <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
            <div className="space-y-3">
                <div className="relative">
                    <VideoPlayer ref={player} videoId={videoId} masterUrl={playback.masterUrl} thumbnailsUrl={playback.thumbnailsUrl}
                                 subtitles={playback.subtitles} chapters={chapters} durationSeconds={durationSeconds} startAt={startAt}
                                 recordProgress={recordProgress} autoPlay={autoPlay} onTime={onTime} onEnded={onEnded}/>
                    {countdown !== null && next && (
                        <div role="status" className="absolute inset-x-0 top-0 flex aspect-video flex-col items-center justify-center gap-3 rounded-lg bg-black/80 p-4 text-center text-white">
                            <p className="text-sm text-white/80">{t("nextIn", {seconds: countdown})}</p>
                            <p className="text-lg font-semibold">{next.title}</p>
                            <div className="flex gap-2">
                                <Button onClick={playNext}><Play/>{t("playNow")}</Button>
                                <Button variant="secondary" onClick={() => setCountdown(null)}><X/>{t("cancel")}</Button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" disabled={pending} aria-pressed={listed} onClick={() => startTransition(async () => {
                        if (await watchListAction(videoId, !listed)) {
                            track("watch-list", {listed: !listed});
                            setListed(!listed);
                        } else {
                            toast.error(t("watchListFailed"));
                        }
                    })}>
                        {listed ? <BookmarkCheck/> : <Bookmark/>}{listed ? t("inWatchList") : t("addToWatchList")}
                    </Button>
                    {recordProgress && (
                        <Button variant="outline" disabled={pending} onClick={() => startTransition(async () => {
                            if (await setWatchedAction(videoId, !watched)) {
                                track("video-watched", {watched: !watched});
                                setWatched(!watched);
                                toast.success(watched ? t("markedUnwatched") : t("markedWatched"));
                            } else {
                                toast.error(t("watchedFailed"));
                            }
                        })}>
                            {watched ? <EyeOff/> : <Eye/>}{watched ? t("markUnwatched") : t("markWatched")}
                        </Button>
                    )}
                    {next && (
                        <>
                            <Button variant="ghost" onClick={playNext}>
                                <Play/>{t("next", {title: next.title})}
                            </Button>
                            <label className="flex items-center gap-2 text-sm">
                                <Switch checked={autoplayNext} onCheckedChange={checked => {
                                    setAutoplayNext(checked);
                                    try {
                                        localStorage.setItem(AUTOPLAY_KEY, String(checked));
                                    } catch {
                                        // The choice lasts until the page is left
                                    }
                                }}/>
                                {t("autoplay")}
                            </label>
                        </>
                    )}
                </div>
            </div>
            {chapters.length > 0 && (
                <section aria-labelledby="chapters" className="space-y-2">
                    <h2 id="chapters" className="font-semibold">{t("chapters")}</h2>
                    <ol className="divide-y rounded-lg border">
                        {chapters.map(chapter => (
                            <li key={chapter.startSeconds} aria-current={chapter === playing ? "true" : undefined}
                                className={cn("flex items-center gap-2 px-3 py-2", chapter === playing && "bg-accent")}>
                                <button type="button" className="flex min-w-0 flex-1 items-baseline gap-3 text-left hover:underline"
                                        onClick={() => player.current?.seek(chapter.startSeconds)}>
                                    <span className="w-14 shrink-0 text-xs tabular-nums text-muted-foreground">{formatDuration(chapter.startSeconds)}</span>
                                    <span className={cn("truncate text-sm", chapter === playing && "font-medium")}>{chapter.title}</span>
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

/**
 * The collections a video is in, as links.
 */
export function CollectionLinks({collections}: { collections: { id: string; title: string }[] }) {
    const t = useTranslations("Watch");

    if (collections.length === 0) {
        return null;
    }
    return (
        <p className="text-sm text-muted-foreground">
            {t("partOf")}{" "}
            {collections.map((collection, i) => (
                <span key={collection.id}>
                    {i > 0 && ", "}
                    <Link href={`/collections/${collection.id}`} className="text-primary hover:underline">{collection.title}</Link>
                </span>
            ))}
        </p>
    );
}
