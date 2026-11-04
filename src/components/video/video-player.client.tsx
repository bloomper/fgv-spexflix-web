"use client";

import * as React from "react";
import {useCallback, useEffect, useImperativeHandle, useRef, useState, useSyncExternalStore} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import type Hls from "hls.js";
import {
    Airplay,
    Captions,
    Check,
    Gauge,
    Keyboard,
    Maximize,
    Minimize,
    Pause,
    PictureInPicture2,
    Play,
    RotateCcw,
    RotateCw,
    Settings2,
    TriangleAlert,
    Volume1,
    Volume2,
    VolumeX
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {useVideoShortcuts, VideoShortcutsDialog} from "@/components/video/shortcuts.client";
import {formatDuration} from "@/utils/duration";
import {parseThumbnails, type Thumbnail, thumbnailAt} from "@/components/video/thumbnails";
import {saveProgressAction} from "@/components/video/actions.server";
import {cn} from "@/utils/utils";
import {track as trackEvent} from "@/utils/umami";

export type PlayerChapter = { startSeconds: number; title: string };
export type PlayerHandle = { seek: (seconds: number) => void; currentTime: () => number; play: () => void };

/** A quality level hls.js can play: its height and bitrate. */
type Level = { height: number; bitrate: number };

type AirPlayVideo = HTMLVideoElement & { webkitShowPlaybackTargetPicker?: () => void; webkitEnterFullscreen?: () => void };

type Props = {
    videoId: string;
    masterUrl: string;
    thumbnailsUrl?: string | null;
    subtitles: { language: string; label: string; url: string }[];
    chapters: PlayerChapter[];
    durationSeconds: number;
    startAt?: number | null;
    /** Where to stop, for a clip of a playlist: the video counts as ended there. */
    endAt?: number | null;
    /** Editors watching unpublished videos do not record progress. */
    recordProgress?: boolean;
    /** Starts playing once loaded, e.g. when the previous video ended and this one follows it. */
    autoPlay?: boolean;
    /** Called as the video plays, with the position in seconds. */
    onTime?: (seconds: number) => void;
    /** Called when the video has played to its end, or to the end of the clip. */
    onEnded?: () => void;
    ref?: React.Ref<PlayerHandle>;
};

const SAVE_EVERY = 15;
const HIDE_AFTER = 3000;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SETTINGS_KEY = "spexflix.player";
const noSubscription = () => () => undefined;

function readSettings(): { volume: number; muted: boolean } {
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") as { volume?: unknown; muted?: unknown };

        return {
            volume: typeof saved.volume === "number" && saved.volume >= 0 && saved.volume <= 1 ? saved.volume : 1,
            muted: saved.muted === true,
        };
    } catch {
        return {volume: 1, muted: false};
    }
}

/**
 * Plays a video's HLS renditions with adaptive quality: natively in Safari, through hls.js elsewhere, with controls of
 * its own in the page's language: play, skipping, volume, a timeline with the chapters and, on hover, the timeline
 * thumbnails, subtitles, speed, quality (with hls.js), AirPlay (Safari), picture-in-picture and full screen. The
 * controls hide while playing when the pointer rests, and show on any movement, focus or pause. Keyboard shortcuts work
 * anywhere on the page. Progress is saved every 15 seconds and when pausing. Volume and mute are remembered
 * ({@code localStorage} {@code spexflix.player}).
 *
 * When the video cannot be loaded (the media server cannot be reached, the signed address has expired, the file is
 * broken), a message replaces the endless loading. Trying again refreshes the page's data, which signs new addresses,
 * and continues from where playing stopped.
 */
export function VideoPlayer({videoId, masterUrl, thumbnailsUrl, subtitles, chapters, durationSeconds, startAt, endAt, recordProgress = true,
                                autoPlay = false, onTime, onEnded, ref}: Props) {
    const t = useTranslations("Player");
    const container = useRef<HTMLDivElement>(null);
    const video = useRef<HTMLVideoElement>(null);
    const [time, setTime] = useState(startAt ?? 0);
    const [duration, setDuration] = useState(durationSeconds);
    const [playing, setPlaying] = useState(false);
    const [started, setStarted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [subtitle, setSubtitle] = useState<string | null>(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [controlsShown, setControlsShown] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
    const [hover, setHover] = useState<{ x: number; width: number; time: number } | null>(null);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const router = useRouter();
    const lastSaved = useRef(0);
    const played = useRef(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ended = useRef(false);
    // Where to start when (re)loading: the requested position first, then where playing got to
    const resumeAt = useRef(startAt ?? 0);
    const hlsRef = useRef<Hls | null>(null);
    const [levels, setLevels] = useState<Level[]>([]);
    const [level, setLevel] = useState(-1);
    const [airPlay, setAirPlay] = useState(false);
    const pictureInPicture = useSyncExternalStore(noSubscription,
        () => "pictureInPictureEnabled" in document && document.pictureInPictureEnabled, () => false);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);
    const callbacks = useRef({onTime, onEnded, endAt});

    useEffect(() => {
        callbacks.current = {onTime, onEnded, endAt};
    }, [onTime, onEnded, endAt]);

    useEffect(() => {
        ended.current = false;
    }, [endAt, startAt]);

    const toggleFullscreen = useCallback(() => {
        const element = container.current;

        if (document.fullscreenElement) {
            void document.exitFullscreen().catch(() => undefined);
        } else if (element?.requestFullscreen) {
            void element.requestFullscreen().catch(() => undefined);
        } else {
            // iPhone: only the video itself goes full screen, with the system's controls
            (video.current as AirPlayVideo | null)?.webkitEnterFullscreen?.();
        }
    }, []);

    useVideoShortcuts(video, chapters, () => setShortcutsOpen(true), toggleFullscreen);

    useEffect(() => {
        const onChange = () => setFullscreen(document.fullscreenElement === container.current);

        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    // Safari tells whether there is an AirPlay receiver nearby
    useEffect(() => {
        const element = video.current;

        if (!element || !("WebKitPlaybackTargetAvailabilityEvent" in window)) {
            return;
        }

        const onAvailability = (event: Event) => setAirPlay((event as Event & { availability?: string }).availability === "available");

        element.addEventListener("webkitplaybacktargetavailabilitychanged", onAvailability);
        return () => element.removeEventListener("webkitplaybacktargetavailabilitychanged", onAvailability);
    }, []);

    const showControls = useCallback(() => {
        setControlsShown(true);
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
        }
        hideTimer.current = setTimeout(() => setControlsShown(false), HIDE_AFTER);
    }, []);

    useEffect(() => () => {
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
        }
    }, []);

    useImperativeHandle(ref, () => ({
        seek: (seconds: number) => {
            if (video.current) {
                ended.current = false;
                video.current.currentTime = seconds;
                void video.current.play().catch(() => undefined);
            }
        },
        currentTime: () => video.current?.currentTime ?? 0,
        play: () => void video.current?.play().catch(() => undefined),
    }), []);

    useEffect(() => {
        const element = video.current;

        if (!element) {
            return;
        }

        let hls: Hls | null = null;
        let cancelled = false;
        const position = resumeAt.current;
        const start = () => {
            if (position > 0) {
                element.currentTime = position;
            }
            if (autoPlay) {
                void element.play().catch(() => undefined);
            }
        };
        const fail = () => {
            if (!cancelled) {
                setFailed(true);
            }
        };
        const playNatively = () => {
            element.addEventListener("error", fail);
            element.addEventListener("loadedmetadata", start, {once: true});
            element.src = masterUrl;
        };

        setFailed(false);
        if (element.canPlayType("application/vnd.apple.mpegurl")) {
            playNatively();
        } else {
            void import("hls.js").then(({default: HlsClass}) => {
                if (cancelled) {
                    return;
                }
                if (!HlsClass.isSupported()) {
                    playNatively();
                    return;
                }

                let recovered = false;
                const instance = new HlsClass({startPosition: position > 0 ? position : -1});

                // hls.js retries loading itself; an error is fatal only when it has given up
                instance.on(HlsClass.Events.ERROR, (_event, data) => {
                    if (!data.fatal) {
                        return;
                    }
                    if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR && !recovered) {
                        recovered = true;
                        instance.recoverMediaError();
                        return;
                    }
                    instance.destroy();
                    hls = null;
                    fail();
                });
                instance.on(HlsClass.Events.MANIFEST_PARSED, (_event, data) => {
                    setLevels(data.levels.map(candidate => ({height: candidate.height, bitrate: candidate.bitrate})));
                    if (autoPlay) {
                        void element.play().catch(() => undefined);
                    }
                });
                instance.loadSource(masterUrl);
                instance.attachMedia(element);
                hls = instance;
                hlsRef.current = instance;
            });
        }
        return () => {
            cancelled = true;
            element.removeEventListener("error", fail);
            element.removeEventListener("loadedmetadata", start);
            hls?.destroy();
            hlsRef.current = null;
            setLevels([]);
            setLevel(-1);
        };
        // autoPlay counts only for the first load, not for a retry
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [masterUrl, attempt]);

    const chooseLevel = (value: number) => {
        setLevel(value);
        if (hlsRef.current) {
            // -1 lets hls.js choose by the connection again
            hlsRef.current.currentLevel = value;
        }
    };

    const chooseSubtitle = (language: string | null) => {
        const element = video.current;

        setSubtitle(language);
        if (element) {
            Array.from(element.textTracks).forEach(track => {
                track.mode = track.language === language ? "showing" : "disabled";
            });
        }
    };

    const chooseSpeed = (value: number) => {
        setSpeed(value);
        if (video.current) {
            video.current.playbackRate = value;
        }
    };

    const changeVolume = (value: number) => {
        const element = video.current;

        if (element) {
            element.volume = value;
            element.muted = value === 0;
        }
    };

    const toggle = () => {
        const element = video.current;

        if (!element) {
            return;
        }
        if (element.paused) {
            ended.current = false;
            void element.play().catch(() => undefined);
        } else {
            element.pause();
        }
    };

    const seekBy = (seconds: number) => {
        if (video.current) {
            video.current.currentTime = Math.min(Math.max(0, video.current.currentTime + seconds), duration || Infinity);
        }
    };

    const retry = () => {
        resumeAt.current = video.current?.currentTime || resumeAt.current;
        router.refresh();
        setAttempt(value => value + 1);
    };

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

        const onTimeUpdate = () => {
            setTime(element.currentTime);
            callbacks.current.onTime?.(element.currentTime);
            if (element.currentTime > 0) {
                resumeAt.current = element.currentTime;
            }
            if (Math.abs(element.currentTime - lastSaved.current) >= SAVE_EVERY) {
                save(element.currentTime);
            }

            const stop = callbacks.current.endAt;

            // A clip ends where its chapter does
            if (stop && element.currentTime >= stop && !ended.current) {
                ended.current = true;
                element.pause();
                callbacks.current.onEnded?.();
            }
        };
        const onPlay = () => {
            setPlaying(true);
            setStarted(true);
        };
        const onPause = () => {
            setPlaying(false);
            save(element.currentTime);
        };
        const onEnd = () => {
            setPlaying(false);
            save(element.currentTime);
            if (!ended.current) {
                ended.current = true;
                callbacks.current.onEnded?.();
            }
        };
        const onDuration = () => Number.isFinite(element.duration) && setDuration(element.duration);
        const onVolume = () => {
            setVolume(element.volume);
            setMuted(element.muted);
            try {
                localStorage.setItem(SETTINGS_KEY, JSON.stringify({volume: element.volume, muted: element.muted}));
            } catch {
                // Remembered until the page is left
            }
        };
        const onRate = () => setSpeed(element.playbackRate);
        const onTracks = () => setSubtitle(Array.from(element.textTracks).find(track => track.mode === "showing")?.language ?? null);

        element.addEventListener("timeupdate", onTimeUpdate);
        element.addEventListener("play", onPlay);
        element.addEventListener("pause", onPause);
        element.addEventListener("ended", onEnd);
        element.addEventListener("durationchange", onDuration);
        element.addEventListener("volumechange", onVolume);
        element.addEventListener("ratechange", onRate);
        element.textTracks?.addEventListener?.("change", onTracks);

        // Volume and mute from the last visit; the volumechange event shows them
        const saved = readSettings();

        element.volume = saved.volume;
        element.muted = saved.muted;
        return () => {
            element.removeEventListener("timeupdate", onTimeUpdate);
            element.removeEventListener("play", onPlay);
            element.removeEventListener("pause", onPause);
            element.removeEventListener("ended", onEnd);
            element.removeEventListener("durationchange", onDuration);
            element.removeEventListener("volumechange", onVolume);
            element.removeEventListener("ratechange", onRate);
            element.textTracks?.removeEventListener?.("change", onTracks);
        };
    }, [save]);

    const preview = hover ? thumbnailAt(thumbnails, hover.time) : undefined;
    const chapterAt = (seconds: number) => chapters.filter(chapter => chapter.startSeconds <= seconds).at(-1);
    const shown = controlsShown || !playing || menuOpen;
    const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
    const controlButton = "size-9 text-white hover:bg-white/15 hover:text-white focus-visible:ring-white/60";
    // The hover box stays inside the player, so that it never makes the page scroll sideways
    const boxWidth = Math.max(preview?.width ?? 0, 96) + 8;
    const boxLeft = hover ? Math.min(Math.max(hover.x - boxWidth / 2, 0), Math.max(hover.width - boxWidth, 0)) : 0;

    return (
        <div className="space-y-2">
            <div ref={container}
                 className={cn("group/player relative overflow-hidden rounded-lg bg-black", fullscreen && "rounded-none", !shown && "cursor-none")}
                 onMouseMove={showControls} onFocusCapture={showControls} onTouchStart={showControls}>
                <video ref={video} playsInline crossOrigin="anonymous" preload="metadata" x-webkit-airplay="allow"
                       onPlay={() => {
                           // Once per page: how many videos are watched, not how often they are paused
                           if (!played.current) {
                               played.current = true;
                               trackEvent("video-play");
                           }
                       }}
                       onClick={toggle} onDoubleClick={toggleFullscreen}
                       className={cn("block aspect-video w-full bg-black", fullscreen && "h-full")} poster={`/api/poster/${videoId}`}>
                    {subtitles.map(entry => (
                        <track key={entry.language} kind="subtitles" src={entry.url} srcLang={entry.language} label={entry.label}/>
                    ))}
                </video>

                {!started && !failed && (
                    <button type="button" onClick={toggle} aria-label={t("play")}
                            className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-black/60 text-white outline-none hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-white">
                        <Play className="size-8 fill-current"/>
                    </button>
                )}

                <div className={cn("absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-2 pt-10 pb-1.5 text-white transition-opacity duration-200 sm:px-3",
                    shown ? "opacity-100" : "pointer-events-none opacity-0")}>
                    <div
                        className="relative h-5 cursor-pointer"
                        onMouseMove={event => {
                            const box = event.currentTarget.getBoundingClientRect();
                            const x = Math.min(Math.max(event.clientX - box.left, 0), box.width);

                            setHover({x, width: box.width, time: duration * x / box.width});
                        }}
                        onMouseLeave={() => setHover(null)}
                        onClick={event => {
                            const box = event.currentTarget.getBoundingClientRect();

                            if (video.current && duration > 0) {
                                ended.current = false;
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
                            if (event.key === "ArrowRight") {
                                event.preventDefault();
                                seekBy(10);
                            } else if (event.key === "ArrowLeft") {
                                event.preventDefault();
                                seekBy(-10);
                            }
                        }}>
                        <div className="absolute top-2 h-1 w-full rounded bg-white/30 transition-[height,top] group-hover/player:top-1.5 group-hover/player:h-2">
                            {endAt && duration > 0 && startAt !== undefined && startAt !== null && (
                                <div className="absolute inset-y-0 bg-white/30"
                                     style={{left: `${100 * startAt / duration}%`, width: `${100 * Math.max(0, endAt - startAt) / duration}%`}}/>
                            )}
                            <div className="relative h-full rounded bg-primary" style={{width: duration > 0 ? `${Math.min(100, 100 * time / duration)}%` : 0}}/>
                        </div>
                        {duration > 0 && chapters.filter(chapter => chapter.startSeconds > 0).map(chapter => (
                            <span key={chapter.startSeconds} className="absolute top-1 h-3 w-0.5 bg-white/70"
                                  style={{left: `${100 * chapter.startSeconds / duration}%`}}/>
                        ))}
                        {hover && (
                            <div className="pointer-events-none absolute bottom-6 z-10 rounded bg-popover p-1 text-center text-xs text-popover-foreground shadow"
                                 style={{left: boxLeft, width: boxWidth}}>
                                {preview && (
                                    <div className="mx-auto mb-1 overflow-hidden rounded" style={{
                                        width: preview.width,
                                        height: preview.height,
                                        backgroundImage: `url("${preview.url}")`,
                                        backgroundPosition: `-${preview.x}px -${preview.y}px`,
                                    }}/>
                                )}
                                <div className="tabular-nums">{formatDuration(hover.time)}</div>
                                {chapterAt(hover.time) && <div className="truncate">{chapterAt(hover.time)?.title}</div>}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-0.5 sm:gap-1">
                        <Button variant="ghost" size="icon" className={controlButton} onClick={toggle} aria-label={playing ? t("pause") : t("play")}>
                            {playing ? <Pause className="fill-current"/> : <Play className="fill-current"/>}
                        </Button>
                        <Button variant="ghost" size="icon" className={cn(controlButton, "hidden sm:inline-flex")} onClick={() => seekBy(-10)} aria-label={t("back")}>
                            <RotateCcw/>
                        </Button>
                        <Button variant="ghost" size="icon" className={cn(controlButton, "hidden sm:inline-flex")} onClick={() => seekBy(10)} aria-label={t("forward")}>
                            <RotateCw/>
                        </Button>
                        <div className="group/volume flex items-center">
                            <Button variant="ghost" size="icon" className={controlButton} aria-label={muted ? t("unmute") : t("mute")}
                                    onClick={() => {
                                        if (video.current) {
                                            video.current.muted = !video.current.muted;
                                        }
                                    }}>
                                <VolumeIcon/>
                            </Button>
                            <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} aria-label={t("volume")}
                                   onChange={event => changeVolume(Number(event.target.value))}
                                   className="hidden h-1 w-0 cursor-pointer accent-white opacity-0 transition-all group-hover/volume:w-20 group-hover/volume:opacity-100 focus:w-20 focus:opacity-100 sm:block"/>
                        </div>
                        <span className="min-w-0 truncate px-1 text-xs tabular-nums sm:text-sm">
                            {formatDuration(time)} / {formatDuration(duration)}
                            {chapterAt(time) && <span className="hidden text-white/80 md:inline"> · {chapterAt(time)?.title}</span>}
                        </span>
                        <span className="flex-1"/>

                        {subtitles.length > 0 && (
                            <DropdownMenu onOpenChange={setMenuOpen}>
                                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className={cn(controlButton, subtitle && "text-primary")}
                                                                     aria-label={t("subtitles")}/>}>
                                    <Captions/>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" side="top" container={container}>
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>{t("subtitles")}</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => chooseSubtitle(null)}>
                                            <Check className={cn(subtitle !== null && "invisible")}/>{t("subtitlesOff")}
                                        </DropdownMenuItem>
                                        {subtitles.map(entry => (
                                            <DropdownMenuItem key={entry.language} onClick={() => chooseSubtitle(entry.language)}>
                                                <Check className={cn(subtitle !== entry.language && "invisible")}/>{entry.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <DropdownMenu onOpenChange={setMenuOpen}>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className={controlButton} aria-label={t("settings")}/>}>
                                <Settings2/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="top" container={container} className="max-h-80">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="flex items-center gap-2"><Gauge className="size-4"/>{t("speed")}</DropdownMenuLabel>
                                    {SPEEDS.map(value => (
                                        <DropdownMenuItem key={value} onClick={() => chooseSpeed(value)}>
                                            <Check className={cn(speed !== value && "invisible")}/>{value === 1 ? t("normalSpeed") : `${value}×`}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                                {levels.length > 1 && (
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>{t("quality")}</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => chooseLevel(-1)}>
                                            <Check className={cn(level !== -1 && "invisible")}/>{t("auto")}
                                        </DropdownMenuItem>
                                        {levels.map((candidate, i) => (
                                            <DropdownMenuItem key={`${candidate.height}-${candidate.bitrate}`} onClick={() => chooseLevel(i)}>
                                                <Check className={cn(level !== i && "invisible")}/>{candidate.height}p
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                )}
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => setShortcutsOpen(true)}>
                                        <Keyboard/>{t("shortcuts")}
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {airPlay && (
                            <Button variant="ghost" size="icon" className={controlButton} aria-label={t("airPlay")}
                                    onClick={() => (video.current as AirPlayVideo | null)?.webkitShowPlaybackTargetPicker?.()}>
                                <Airplay/>
                            </Button>
                        )}
                        {pictureInPicture && (
                            <Button variant="ghost" size="icon" className={cn(controlButton, "hidden sm:inline-flex")} aria-label={t("pictureInPicture")}
                                    onClick={() => {
                                        if (document.pictureInPictureElement) {
                                            void document.exitPictureInPicture().catch(() => undefined);
                                        } else {
                                            void video.current?.requestPictureInPicture().catch(() => undefined);
                                        }
                                    }}>
                                <PictureInPicture2/>
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className={controlButton} onClick={toggleFullscreen}
                                aria-label={fullscreen ? t("exitFullscreen") : t("fullscreen")}>
                            {fullscreen ? <Minimize/> : <Maximize/>}
                        </Button>
                    </div>
                </div>

                {failed && (
                    <div role="alert"
                         className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-4 text-center text-white">
                        <TriangleAlert className="size-8" aria-hidden/>
                        <div>
                            <p className="font-medium">{t("error")}</p>
                            <p className="text-sm text-white/80">{t("errorHint")}</p>
                        </div>
                        <Button variant="secondary" onClick={retry}>
                            <RotateCcw/>
                            {t("retry")}
                        </Button>
                    </div>
                )}
            </div>
            <VideoShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}/>
        </div>
    );
}
