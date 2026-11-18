"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Google's Cast sender, with the Cast framework. The Content Security Policy allows its host (src/utils/csp.ts). */
export const CAST_SENDER_URL = "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";

// The parts of Google's Cast sender (cast.framework and chrome.cast) that Spexflix uses
type RemotePlayer = {
  isConnected: boolean;
  currentTime: number;
  duration: number;
  isPaused: boolean;
  playerState: string | null;
  mediaInfo: { customData?: { videoId?: string } | null } | null;
};
type RemotePlayerController = {
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
  playOrPause: () => void;
  seek: () => void;
};
type MediaSession = { editTracksInfo: (request: unknown, success: () => void, failure: () => void) => void };
type CastSession = {
  loadMedia: (request: unknown) => Promise<unknown>;
  getMediaSession: () => MediaSession | null;
  getCastDevice: () => { friendlyName?: string } | null;
};
type CastContext = {
  setOptions: (options: Record<string, unknown>) => void;
  addEventListener: (type: string, listener: (event: { castState: string }) => void) => void;
  removeEventListener: (type: string, listener: (event: { castState: string }) => void) => void;
  getCastState: () => string;
  requestSession: () => Promise<unknown>;
  getCurrentSession: () => CastSession | null;
  endCurrentSession: (stopCasting: boolean) => void;
};
type Settable = Record<string, unknown>;
export type CastFramework = {
  CastContext: { getInstance: () => CastContext };
  CastContextEventType: { CAST_STATE_CHANGED: string };
  CastState: { NO_DEVICES_AVAILABLE: string; CONNECTED: string };
  RemotePlayer: new () => RemotePlayer;
  RemotePlayerController: new (player: RemotePlayer) => RemotePlayerController;
  RemotePlayerEventType: { ANY_CHANGE: string };
};
export type ChromeCast = {
  AutoJoinPolicy: { ORIGIN_SCOPED: string };
  media: {
    DEFAULT_MEDIA_RECEIVER_APP_ID: string;
    MediaInfo: new (contentId: string, contentType: string) => Settable;
    GenericMediaMetadata: new () => Settable;
    LoadRequest: new (media: unknown) => Settable;
    Track: new (trackId: number, type: string) => Settable;
    TrackType: { TEXT: string };
    TextTrackType: { SUBTITLES: string };
    StreamType: { BUFFERED: string };
    HlsSegmentFormat?: { TS: string };
    HlsVideoSegmentFormat?: { MPEG2_TS: string };
    EditTracksInfoRequest: new (activeTrackIds: number[]) => unknown;
  };
};
type CastWindow = Window & {
  cast?: { framework?: CastFramework };
  chrome?: { cast?: ChromeCast };
  __onGCastApiAvailable?: (available: boolean) => void;
};

let loading: Promise<boolean> | null = null;

function initialise(w: CastWindow): boolean {
  const framework = w.cast?.framework;
  const chromeCast = w.chrome?.cast;

  if (!framework || !chromeCast) {
    return false;
  }
  try {
    framework.CastContext.getInstance().setOptions({
      receiverApplicationId: chromeCast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: chromeCast.AutoJoinPolicy.ORIGIN_SCOPED,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads Google's Cast sender once per page, true when the browser can cast. Only Chrome-like browsers (Chrome, Edge,
 * Android) can, so elsewhere nothing is loaded.
 */
export function loadCast(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }
  if (!loading) {
    const w = window as CastWindow;

    loading = new Promise<boolean>(resolve => {
      if (!w.chrome) {
        resolve(false);
        return;
      }
      if (w.cast?.framework) {
        resolve(initialise(w));
        return;
      }
      w.__onGCastApiAvailable = available => resolve(available && initialise(w));

      const script = document.createElement("script");

      script.src = CAST_SENDER_URL;
      script.async = true;
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }
  return loading;
}

/** Forgets the loaded sender, for tests. */
export function resetCast() {
  loading = null;
}

export type CastMedia = {
  videoId: string;
  title: string;
  /** The signed master playlist. */
  url: string;
  subtitles: { language: string; label: string; url: string }[];
};

export type CastEvents = {
  /** The receiver's position, as it plays. */
  onTime?: (seconds: number) => void;
  /** The video played to its end on the receiver. */
  onEnded?: () => void;
  /** Casting stopped, or the receiver went on to something else, at this position. */
  onStop?: (seconds: number) => void;
};

export type Cast = {
  /** Whether the browser can cast and a receiver is near: show the cast button. */
  available: boolean;
  /** Whether a receiver is connected, playing this video or not. */
  connected: boolean;
  /** Whether the receiver plays this video: the page is its remote. */
  casting: boolean;
  /** The receiver's name, e.g. "Vardagsrummet". */
  device: string | null;
  time: number;
  duration: number;
  paused: boolean;
  /** Connects to a receiver, asking the viewer for one when none is connected, and plays the video there. */
  start: (seconds: number, subtitle: string | null) => Promise<void>;
  stop: () => void;
  playOrPause: () => void;
  seek: (seconds: number) => void;
  setSubtitle: (language: string | null) => void;
};

const castWindow = () => typeof window === "undefined" ? undefined : window as CastWindow;
const framework = () => castWindow()?.cast?.framework;
const chromeCast = () => castWindow()?.chrome?.cast;

type Remote = { ours: boolean; time: number; duration: number; paused: boolean; state: string | null; device: string | null };

const IDLE: Remote = { ours: false, time: 0, duration: 0, paused: true, state: null, device: null };

/**
 * Casting a video to a Chromecast with Google's Default Media Receiver: the receiver plays the same signed HLS
 * playlist, with the subtitles as text tracks, and this page becomes its remote. Nothing is loaded unless enabled.
 */
export function useCast(enabled: boolean, media: CastMedia, events: CastEvents = {}): Cast {
  const [castState, setCastState] = useState<string | null>(null);
  const [remote, setRemote] = useState<Remote>(IDLE);
  const player = useRef<RemotePlayer | null>(null);
  const controller = useRef<RemotePlayerController | null>(null);
  const latest = useRef({ media, events });
  const last = useRef<Remote>(IDLE);

  useEffect(() => {
    latest.current = { media, events };
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    let cleanup = () => undefined as void;

    void loadCast().then(ok => {
      const cast = framework();

      if (!ok || cancelled || !cast) {
        return;
      }

      const context = cast.CastContext.getInstance();
      const remotePlayer = new cast.RemotePlayer();
      const remoteController = new cast.RemotePlayerController(remotePlayer);
      const onState = (event: { castState: string }) => setCastState(event.castState);
      const onChange = () => {
        const was = last.current;
        const ours = remotePlayer.isConnected && remotePlayer.mediaInfo?.customData?.videoId === latest.current.media.videoId;
        const now: Remote = {
          ours,
          time: ours ? remotePlayer.currentTime : was.time,
          duration: ours && remotePlayer.duration > 0 ? remotePlayer.duration : was.duration,
          paused: remotePlayer.isPaused,
          state: remotePlayer.playerState,
          device: remotePlayer.isConnected ? context.getCurrentSession()?.getCastDevice()?.friendlyName ?? null : null,
        };
        const ended = was.ours && was.state !== "IDLE" && (!ours || now.state === "IDLE")
          && was.duration > 0 && was.time >= was.duration - 3;

        last.current = now;
        setRemote(now);
        if (ours && now.time !== was.time) {
          latest.current.events.onTime?.(now.time);
        }
        if (ended) {
          latest.current.events.onEnded?.();
        } else if (was.ours && !ours) {
          latest.current.events.onStop?.(was.time);
        }
      };

      player.current = remotePlayer;
      controller.current = remoteController;
      context.addEventListener(cast.CastContextEventType.CAST_STATE_CHANGED, onState);
      remoteController.addEventListener(cast.RemotePlayerEventType.ANY_CHANGE, onChange);
      setCastState(context.getCastState());
      onChange();
      cleanup = () => {
        context.removeEventListener(cast.CastContextEventType.CAST_STATE_CHANGED, onState);
        remoteController.removeEventListener(cast.RemotePlayerEventType.ANY_CHANGE, onChange);
        player.current = null;
        controller.current = null;
      };
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [enabled]);

  const start = useCallback(async (seconds: number, subtitle: string | null) => {
    const cast = framework();
    const chrome = chromeCast();

    if (!cast || !chrome) {
      return;
    }

    const context = cast.CastContext.getInstance();

    if (!context.getCurrentSession()) {
      try {
        await context.requestSession();
      } catch {
        // The viewer closed the list of receivers
        return;
      }
    }

    const session = context.getCurrentSession();

    if (!session) {
      return;
    }

    const { videoId, title, url, subtitles } = latest.current.media;
    const info = new chrome.media.MediaInfo(url, "application/vnd.apple.mpegurl");
    const metadata = new chrome.media.GenericMediaMetadata();

    metadata.title = title;
    // The default poster lies beside the playlist, under the same signature; the receiver has no login for /api/poster
    metadata.images = [{ url: url.replace(/master\.m3u8$/, "poster.jpg") }];
    info.metadata = metadata;
    info.streamType = chrome.media.StreamType.BUFFERED;
    info.hlsSegmentFormat = chrome.media.HlsSegmentFormat?.TS;
    info.hlsVideoSegmentFormat = chrome.media.HlsVideoSegmentFormat?.MPEG2_TS;
    info.customData = { videoId };
    info.tracks = subtitles.map((entry, i) => {
      const track = new chrome.media.Track(i + 1, chrome.media.TrackType.TEXT);

      track.trackContentId = entry.url;
      track.trackContentType = "text/vtt";
      track.subtype = chrome.media.TextTrackType.SUBTITLES;
      track.name = entry.label;
      track.language = entry.language;
      return track;
    });

    const request = new chrome.media.LoadRequest(info);
    const track = subtitles.findIndex(entry => entry.language === subtitle) + 1;

    request.currentTime = seconds;
    request.autoplay = true;
    request.activeTrackIds = track > 0 ? [track] : [];
    await session.loadMedia(request).catch(() => undefined);
  }, []);

  const stop = useCallback(() => framework()?.CastContext.getInstance().endCurrentSession(true), []);
  const playOrPause = useCallback(() => controller.current?.playOrPause(), []);
  const seek = useCallback((seconds: number) => {
    if (player.current && controller.current) {
      player.current.currentTime = seconds;
      controller.current.seek();
    }
  }, []);
  const setSubtitle = useCallback((language: string | null) => {
    const chrome = chromeCast();
    const session = framework()?.CastContext.getInstance().getCurrentSession()?.getMediaSession();
    const track = latest.current.media.subtitles.findIndex(entry => entry.language === language) + 1;

    if (chrome && session) {
      session.editTracksInfo(new chrome.media.EditTracksInfoRequest(track > 0 ? [track] : []), () => undefined, () => undefined);
    }
  }, []);

  const states = framework()?.CastState;

  return {
    available: enabled && castState !== null && castState !== states?.NO_DEVICES_AVAILABLE,
    connected: enabled && castState !== null && castState === states?.CONNECTED,
    casting: enabled && remote.ours,
    device: remote.device,
    time: remote.time,
    duration: remote.duration,
    paused: remote.paused,
    start,
    stop,
    playOrPause,
    seek,
    setSubtitle,
  };
}
