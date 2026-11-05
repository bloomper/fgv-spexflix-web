"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Clock, Eye, EyeOff, Heart, ListVideo, Music, Play, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { type PlayerHandle, VideoPlayer } from "@/components/video/video-player.client";
import { likeVideoAction, playbackAction, setWatchedAction, watchListAction } from "@/components/video/actions.server";
import { AddToPlaylistMenu, type OwnPlaylist } from "@/components/video/add-to-playlist.client";
import { formatDuration } from "@/utils/duration";
import { cn } from "@/utils/utils";
import { useServerState } from "@/hooks/use-server-state.client";
import { track } from "@/utils/umami";

type Chapter = {
  startSeconds: number;
  title: string;
  spexifyTrackId?: string | null;
  spexifyTrackTitle?: string | null
};

/** What plays after this: a video, or the next item of the playlist being played. */
export type NextUp = { href: string; title: string };

/** The playlist being played and where in it the viewer is. */
export type PlaylistContext = {
  id: string;
  name: string;
  index: number;
  items: { id: string; href: string; title: string; videoTitle: string; clip: boolean; durationSeconds: number }[];
};

const AUTOPLAY_KEY = "spexflix.autoplay";
const COUNTDOWN = 10;
/** How long before the signed addresses run out they are renewed when the page is looked at again. */
const RENEW_BEFORE_MS = 30 * 60 * 1000;

type Playback = {
  masterUrl: string;
  thumbnailsUrl?: string | null;
  /** When the signed addresses stop working, as an ISO date and time. */
  expiresAt?: string | null;
  subtitles: { language: string; label: string; url: string }[];
};

function readAutoplay(): boolean {
  try {
    return localStorage.getItem(AUTOPLAY_KEY) !== "false";
  } catch {
    return true;
  }
}

/**
 * The player with its chapter list beside it: a chapter jumps there, the playing one is marked, a chapter can be added
 * to a playlist as a clip, and a chapter linked to a track links to Spexify. When the video (or the playlist's clip)
 * ends and something follows it (the next item of the playlist, the next in a collection, or of the same spex), that
 * starts after a countdown unless the viewer turned it off.
 */
export function Watch({
                        videoId,
                        playback,
                        chapters,
                        durationSeconds,
                        startAt,
                        endAt,
                        inWatchList,
                        liked: initialLiked,
                        finished,
                        spexifyUrl,
                        recordProgress,
                        next,
                        autoPlay,
                        playlists,
                        playlist,
                      }: {
  videoId: string;
  playback: Playback;
  chapters: Chapter[];
  durationSeconds: number;
  startAt: number | null;
  endAt?: number | null;
  inWatchList: boolean;
  liked: boolean;
  finished: boolean;
  spexifyUrl: string | null;
  recordProgress: boolean;
  next: NextUp | null;
  autoPlay: boolean;
  playlists: OwnPlaylist[];
  playlist?: PlaylistContext | null;
}) {
  const t = useTranslations("Watch");
  const router = useRouter();
  const player = useRef<PlayerHandle>(null);
  // The signed addresses, renewed here when they run out on a page left open
  const [current, setCurrent] = useServerState(playback, value => value.masterUrl);
  const [listed, setListed] = useServerState(inWatchList);
  const [liked, setLiked] = useServerState(initialLiked);
  const [watched, setWatched] = useServerState(finished);
  const [pending, startTransition] = useTransition();
  const [time, setTime] = useState(startAt ?? 0);
  const [autoplayNext, setAutoplayNext] = useState(() => typeof window === "undefined" ? true : readAutoplay());
  const [countdown, setCountdown] = useState<number | null>(null);
  const playing = chapters.filter(chapter => chapter.startSeconds <= time).at(-1);

  const go = useCallback((automatic: boolean) => {
    if (next) {
      setCountdown(null);
      track("video-next", { automatic, playlist: Boolean(playlist) });
      router.push(next.href);
    }
  }, [next, playlist, router]);

  useEffect(() => {
    if (countdown === null || !next) {
      return;
    }

    const timer = setTimeout(() => {
      if (countdown <= 1) {
        go(true);
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, next, go]);

  const onEnded = useCallback(() => {
    if (!endAt) {
      setWatched(true);
    }
    if (next && autoplayNext) {
      setCountdown(COUNTDOWN);
    }
  }, [autoplayNext, endAt, next, setWatched]);

  const renew = useCallback(async () => {
    const fresh = await playbackAction(videoId);

    if (fresh) {
      setCurrent(fresh);
    }
    return Boolean(fresh);
  }, [setCurrent, videoId]);

  // Coming back to a page that has been open, or kept alive, for hours: sign anew before the old addresses fail
  useEffect(() => {
    const check = () => {
      if (document.visibilityState === "visible" && current.expiresAt
        && Date.parse(current.expiresAt) - Date.now() < RENEW_BEFORE_MS) {
        void renew();
      }
    };

    check();
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, [current.expiresAt, renew]);

  const onTime = useCallback((seconds: number) => {
    setTime(seconds);
    setCountdown(current => current !== null && seconds < (endAt ?? durationSeconds) - 1 ? null : current);
  }, [durationSeconds, endAt]);

  return (
    <div className={cn("grid gap-6", (playlist || chapters.length > 0) && "xl:grid-cols-[minmax(0,1fr)_20rem]")}>
      <div className="min-w-0 space-y-3">
        <div className="relative">
          <VideoPlayer ref={player} videoId={videoId} masterUrl={current.masterUrl}
                       thumbnailsUrl={current.thumbnailsUrl}
                       subtitles={current.subtitles} onRenew={renew} chapters={chapters} durationSeconds={durationSeconds}
                       startAt={startAt}
                       endAt={endAt} recordProgress={recordProgress} autoPlay={autoPlay} onTime={onTime}
                       onEnded={onEnded} />
          {countdown !== null && next && (
            <div role="status"
                 className="absolute inset-x-0 top-0 flex aspect-video flex-col items-center justify-center gap-3 rounded-lg bg-black/80 p-4 text-center text-white">
              <p className="text-sm text-white/80">{t("nextIn", { seconds: countdown })}</p>
              <p className="text-lg font-semibold">{next.title}</p>
              <div className="flex gap-2">
                <Button onClick={() => go(false)}><Play />{t("playNow")}</Button>
                <Button variant="secondary" onClick={() => setCountdown(null)}><X />{t("cancel")}</Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled={pending} aria-pressed={liked} onClick={() => startTransition(async () => {
            const value = !liked;

            setLiked(value);
            if (await likeVideoAction(videoId, value)) {
              track("video-like", { liked: value });
            } else {
              setLiked(!value);
              toast.error(t("likeFailed"));
            }
          })}>
            <Heart className={cn(liked && "fill-current text-rose-500")} />{liked ? t("unlike") : t("like")}
          </Button>
          <Button variant="outline" disabled={pending} aria-pressed={listed}
                  onClick={() => startTransition(async () => {
                    if (await watchListAction(videoId, !listed)) {
                      track("watch-list", { listed: !listed });
                      setListed(!listed);
                    } else {
                      toast.error(t("watchListFailed"));
                    }
                  })}>
            <Clock className={cn(listed && "text-primary")} />{listed ? t("inWatchList") : t("addToWatchList")}
          </Button>
          <AddToPlaylistMenu videoId={videoId} playlists={playlists} label={t("thisVideo")} />
          {recordProgress && (
            <Button variant="ghost" disabled={pending} onClick={() => startTransition(async () => {
              if (await setWatchedAction(videoId, !watched)) {
                track("video-watched", { watched: !watched });
                setWatched(!watched);
                toast.success(watched ? t("markedUnwatched") : t("markedWatched"));
              } else {
                toast.error(t("watchedFailed"));
              }
            })}>
              {watched ? <EyeOff /> : <Eye />}{watched ? t("markUnwatched") : t("markWatched")}
            </Button>
          )}
          {next && (
            <>
              <Button variant="ghost" onClick={() => go(false)}>
                <Play />{t("next", { title: next.title })}
              </Button>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={autoplayNext} onCheckedChange={checked => {
                  setAutoplayNext(checked);
                  try {
                    localStorage.setItem(AUTOPLAY_KEY, String(checked));
                  } catch {
                    // The choice lasts until the page is left
                  }
                }} />
                {t("autoplay")}
              </label>
            </>
          )}
        </div>
      </div>
      {(playlist || chapters.length > 0) && <div className="min-w-0 space-y-6">
        {playlist && (
          <section aria-labelledby="playlist" className="space-y-2">
            <h2 id="playlist" className="flex items-center gap-2 font-semibold">
              <ListVideo className="size-4" />
              <Link href={`/playlists/${playlist.id}`} className="truncate hover:underline">{playlist.name}</Link>
              <span className="shrink-0 text-sm font-normal text-muted-foreground tabular-nums">
                                {t("position", { index: playlist.index + 1, count: playlist.items.length })}
                            </span>
            </h2>
            <ol className="max-h-80 divide-y overflow-y-auto rounded-lg border">
              {playlist.items.map((item, i) => (
                <li key={item.id} aria-current={i === playlist.index ? "true" : undefined}
                    className={cn("px-3 py-2 text-sm", i === playlist.index && "bg-accent")}>
                  <Link href={item.href} className="flex min-w-0 items-baseline gap-3 hover:underline">
                    <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                                            <span
                                              className={cn("block truncate", i === playlist.index && "font-medium")}>{item.title}</span>
                      {item.clip &&
                        <span className="block truncate text-xs text-muted-foreground">{item.videoTitle}</span>}
                                        </span>
                    <span
                      className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatDuration(item.durationSeconds)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}
        {chapters.length > 0 && (
          <section aria-labelledby="chapters" className="space-y-2">
            <h2 id="chapters" className="font-semibold">{t("chapters")}</h2>
            <ol className="divide-y rounded-lg border">
              {chapters.map(chapter => (
                <li key={chapter.startSeconds} aria-current={chapter === playing ? "true" : undefined}
                    className={cn("flex items-center gap-2 px-3 py-1.5", chapter === playing && "bg-accent")}>
                  <button type="button" className="flex min-w-0 flex-1 items-baseline gap-3 text-left hover:underline"
                          onClick={() => player.current?.seek(chapter.startSeconds)}>
                    <span
                      className="w-14 shrink-0 text-xs tabular-nums text-muted-foreground">{formatDuration(chapter.startSeconds)}</span>
                    <span
                      className={cn("truncate text-sm", chapter === playing && "font-medium")}>{chapter.title}</span>
                  </button>
                  {spexifyUrl && chapter.spexifyTrackId && (
                    <a href={`${spexifyUrl}/search?q=${encodeURIComponent(chapter.spexifyTrackTitle ?? chapter.title)}`}
                       target="_blank" rel="noopener noreferrer"
                       className="inline-flex shrink-0 items-center gap-1 text-xs text-primary hover:underline"
                       aria-label={t("listenInSpexify", { title: chapter.title })}>
                      <Music className="size-3.5" />{t("listen")}
                    </a>
                  )}
                  <AddToPlaylistMenu videoId={videoId} startSeconds={chapter.startSeconds} playlists={playlists}
                                     label={chapter.title} compact />
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>}
    </div>
  );
}

/**
 * The collections a video is in, as links.
 */
export function CollectionLinks({ collections }: { collections: { id: string; title: string }[] }) {
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
          <Link href={`/collections/${collection.id}`}
                className="text-primary hover:underline">{collection.title}</Link>
                </span>
      ))}
    </p>
  );
}
