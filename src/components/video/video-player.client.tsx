"use client";

import * as React from "react";
import {useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import type Hls from "hls.js";
import {formatDuration} from "@/utils/duration";
import {parseThumbnails, type Thumbnail, thumbnailAt} from "@/components/video/thumbnails";
import {saveProgressAction} from "@/components/video/actions.server";
import {cn} from "@/utils/utils";
import {track as trackEvent} from "@/utils/umami";

export type PlayerChapter = { startSeconds: number; title: string };
export type PlayerHandle = { seek: (seconds: number) => void; currentTime: () => number };

type Props = {
    videoId: string;
    masterUrl: string;
    thumbnailsUrl?: string | null;
    subtitles: { language: string; label: string; url: string }[];
    chapters: PlayerChapter[];
    durationSeconds: number;
    startAt?: number | null;
    /** Editors watching unpublished videos do not record progress. */
    recordProgress?: boolean;
    ref?: React.Ref<PlayerHandle>;
};

const SAVE_EVERY = 15;

/**
 * Plays a video's HLS renditions with adaptive quality: natively in Safari, through hls.js elsewhere. The browser's own
 * controls handle play, volume, subtitles, speed, full screen and picture-in-picture; below them a timeline shows the
 * chapters and, on hover, the timeline thumbnails. Progress is saved every 15 seconds and when pausing.
 */
export function VideoPlayer({videoId, masterUrl, thumbnailsUrl, subtitles, chapters, durationSeconds, startAt, recordProgress = true, ref}: Props) {
    const t = useTranslations("Player");
    const video = useRef<HTMLVideoElement>(null);
    const [time, setTime] = useState(startAt ?? 0);
    const [duration, setDuration] = useState(durationSeconds);
    const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
    const [hover, setHover] = useState<{ x: number; time: number } | null>(null);
    const lastSaved = useRef(0);
    const played = useRef(false);

    useImperativeHandle(ref, () => ({
        seek: (seconds: number) => {
            if (video.current) {
                video.current.currentTime = seconds;
                void video.current.play().catch(() => undefined);
            }
        },
        currentTime: () => video.current?.currentTime ?? 0,
    }), []);

    useEffect(() => {
        const element = video.current;

        if (!element) {
            return;
        }

        let hls: Hls | null = null;
        const start = () => {
            if (startAt && startAt > 0) {
                element.currentTime = startAt;
            }
        };

        if (element.canPlayType("application/vnd.apple.mpegurl")) {
            element.src = masterUrl;
            element.addEventListener("loadedmetadata", start, {once: true});
        } else {
            void import("hls.js").then(({default: HlsClass}) => {
                if (!HlsClass.isSupported()) {
                    element.src = masterUrl;
                    return;
                }
                hls = new HlsClass({startPosition: startAt ?? -1});
                hls.loadSource(masterUrl);
                hls.attachMedia(element);
            });
        }
        return () => {
            hls?.destroy();
        };
    }, [masterUrl, startAt]);

    useEffect(() => {
        if (!thumbnailsUrl) {
            return;
        }
        fetch(thumbnailsUrl).then(response => response.ok ? response.text() : "").then(text => setThumbnails(parseThumbnails(text, thumbnailsUrl))).catch(() => undefined);
    }, [thumbnailsUrl]);

    const save = useCallback((position: number) => {
        if (recordProgress) {
            lastSaved.current = position;
            void saveProgressAction(videoId, position);
        }
    }, [recordProgress, videoId]);

    useEffect(() => {
        const element = video.current;

        if (!element) {
            return;
        }

        const onTime = () => {
            setTime(element.currentTime);
            if (Math.abs(element.currentTime - lastSaved.current) >= SAVE_EVERY) {
                save(element.currentTime);
            }
        };
        const onPause = () => save(element.currentTime);
        const onDuration = () => Number.isFinite(element.duration) && setDuration(element.duration);

        element.addEventListener("timeupdate", onTime);
        element.addEventListener("pause", onPause);
        element.addEventListener("ended", onPause);
        element.addEventListener("durationchange", onDuration);
        return () => {
            element.removeEventListener("timeupdate", onTime);
            element.removeEventListener("pause", onPause);
            element.removeEventListener("ended", onPause);
            element.removeEventListener("durationchange", onDuration);
        };
    }, [save]);

    const preview = hover ? thumbnailAt(thumbnails, hover.time) : undefined;
    const chapterAt = (seconds: number) => chapters.filter(chapter => chapter.startSeconds <= seconds).at(-1);

    return (
        <div className="space-y-2">
            <video ref={video} controls playsInline crossOrigin="anonymous" preload="metadata"
                   onPlay={() => {
                       // Once per page: how many videos are watched, not how often they are paused
                       if (!played.current) {
                           played.current = true;
                           trackEvent("video-play");
                       }
                   }}
                   className="aspect-video w-full rounded-lg bg-black" poster={`/api/poster/${videoId}`}>
                {subtitles.map(subtitle => (
                    <track key={subtitle.language} kind="subtitles" src={subtitle.url} srcLang={subtitle.language} label={subtitle.label}/>
                ))}
            </video>
            <div className="relative px-1">
                <div
                    className="relative h-6 cursor-pointer"
                    onMouseMove={event => {
                        const box = event.currentTarget.getBoundingClientRect();
                        const x = Math.min(Math.max(event.clientX - box.left, 0), box.width);

                        setHover({x, time: duration * x / box.width});
                    }}
                    onMouseLeave={() => setHover(null)}
                    onClick={event => {
                        const box = event.currentTarget.getBoundingClientRect();

                        if (video.current && duration > 0) {
                            video.current.currentTime = duration * (event.clientX - box.left) / box.width;
                        }
                    }}
                    role="slider"
                    tabIndex={0}
                    aria-label={t("timeline")}
                    aria-valuemin={0}
                    aria-valuemax={Math.round(duration)}
                    aria-valuenow={Math.round(time)}
                    aria-valuetext={formatDuration(time)}
                    onKeyDown={event => {
                        if (!video.current) {
                            return;
                        }
                        if (event.key === "ArrowRight") {
                            video.current.currentTime = Math.min(duration, time + 10);
                        } else if (event.key === "ArrowLeft") {
                            video.current.currentTime = Math.max(0, time - 10);
                        }
                    }}>
                    <div className="absolute top-2.5 h-1 w-full rounded bg-muted">
                        <div className="h-full rounded bg-primary" style={{width: duration > 0 ? `${100 * time / duration}%` : 0}}/>
                    </div>
                    {duration > 0 && chapters.filter(chapter => chapter.startSeconds > 0).map(chapter => (
                        <span key={chapter.startSeconds} className="absolute top-1.5 h-3 w-0.5 bg-foreground/60"
                              style={{left: `${100 * chapter.startSeconds / duration}%`}}/>
                    ))}
                    {hover && (
                        <div className="pointer-events-none absolute bottom-7 z-10 -translate-x-1/2 rounded bg-popover p-1 text-center text-xs shadow"
                             style={{left: hover.x}}>
                            {preview && (
                                <div className="mb-1 overflow-hidden rounded" style={{
                                    width: preview.width,
                                    height: preview.height,
                                    backgroundImage: `url("${preview.url}")`,
                                    backgroundPosition: `-${preview.x}px -${preview.y}px`,
                                }}/>
                            )}
                            <div className="tabular-nums">{formatDuration(hover.time)}</div>
                            {chapterAt(hover.time) && <div className="max-w-40 truncate">{chapterAt(hover.time)?.title}</div>}
                        </div>
                    )}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                    <span className={cn(chapterAt(time) && "truncate")}>{formatDuration(time)}{chapterAt(time) ? ` · ${chapterAt(time)?.title}` : ""}</span>
                    <span>{formatDuration(duration)}</span>
                </div>
            </div>
        </div>
    );
}
