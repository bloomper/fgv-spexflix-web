import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { VideoPlayer } from "@/components/video/video-player.client";
import { CAST_SENDER_URL, loadCast, resetCast } from "@/components/video/cast.client";

const saveProgressAction = vi.hoisted(() => vi.fn());

vi.mock("@/components/video/actions.server", () => ({ saveProgressAction }));
vi.mock("@/utils/umami", () => ({ track: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const MASTER = "https://media.test/v/9/sig/1/3/master.m3u8";
const SUBTITLES = [
  { language: "sv", label: "Svenska", url: "https://media.test/v/9/sig/1/subtitles/sv.vtt" },
  { language: "en", label: "English", url: "https://media.test/v/9/sig/1/subtitles/en.vtt" },
];
const CHAPTERS = [
  { startSeconds: 0, title: "Ouvertyr" },
  { startSeconds: 60, title: "Första akten" },
];

type Player = {
  isConnected: boolean;
  currentTime: number;
  duration: number;
  isPaused: boolean;
  playerState: string | null;
  mediaInfo: { customData?: { videoId?: string } } | null;
};

/** Google's Cast sender as far as Spexflix uses it, with a receiver that plays what it is given. */
function installCast(initialState = "NOT_CONNECTED") {
  const stateListeners: ((event: { castState: string }) => void)[] = [];
  const changeListeners: (() => void)[] = [];
  const player: Player = {
    isConnected: false,
    currentTime: 0,
    duration: 0,
    isPaused: true,
    playerState: null,
    mediaInfo: null,
  };
  const emit = () => changeListeners.forEach((listener) => listener());
  const setState = (value: string) => {
    state = value;
    stateListeners.forEach((listener) => listener({ castState: value }));
  };
  const mediaSession = { editTracksInfo: vi.fn() };
  const session = {
    loadMedia: vi.fn(async (request: { media: Player["mediaInfo"]; currentTime: number }) => {
      Object.assign(player, {
        isConnected: true,
        mediaInfo: request.media,
        currentTime: request.currentTime,
        duration: 120,
        isPaused: false,
        playerState: "PLAYING",
      });
      emit();
    }),
    getMediaSession: () => mediaSession,
    getCastDevice: () => ({ friendlyName: "Vardagsrummet" }),
  };
  let state = initialState;
  let current: typeof session | null = initialState === "CONNECTED" ? session : null;
  const context = {
    setOptions: vi.fn(),
    addEventListener: (_type: string, listener: (event: { castState: string }) => void) =>
      stateListeners.push(listener),
    removeEventListener: vi.fn(),
    getCastState: () => state,
    requestSession: vi.fn(async () => {
      current = session;
      setState("CONNECTED");
    }),
    getCurrentSession: () => current,
    endCurrentSession: vi.fn(() => {
      current = null;
      Object.assign(player, { isConnected: false, mediaInfo: null, playerState: null });
      setState("NOT_CONNECTED");
      emit();
    }),
  };
  const controller = {
    playOrPause: vi.fn(() => {
      player.isPaused = !player.isPaused;
      emit();
    }),
    seek: vi.fn(() => emit()),
  };

  class Simple {
    constructor(...args: unknown[]) {
      Object.assign(this, { args });
    }
  }

  vi.stubGlobal("cast", {
    framework: {
      CastContext: { getInstance: () => context },
      CastContextEventType: { CAST_STATE_CHANGED: "caststatechanged" },
      CastState: {
        NO_DEVICES_AVAILABLE: "NO_DEVICES_AVAILABLE",
        NOT_CONNECTED: "NOT_CONNECTED",
        CONNECTED: "CONNECTED",
      },
      RemotePlayer: function RemotePlayer() {
        return player;
      },
      RemotePlayerController: function RemotePlayerController() {
        return {
          ...controller,
          addEventListener: (_type: string, listener: () => void) => changeListeners.push(listener),
          removeEventListener: vi.fn(),
        };
      },
      RemotePlayerEventType: { ANY_CHANGE: "anyChanged" },
    },
  });
  vi.stubGlobal("chrome", {
    cast: {
      AutoJoinPolicy: { ORIGIN_SCOPED: "origin_scoped" },
      media: {
        DEFAULT_MEDIA_RECEIVER_APP_ID: "CC1AD845",
        MediaInfo: class {
          constructor(
            public contentId: string,
            public contentType: string
          ) {}
        },
        GenericMediaMetadata: Simple,
        LoadRequest: class {
          constructor(public media: unknown) {}
        },
        Track: class {
          constructor(
            public trackId: number,
            public type: string
          ) {}
        },
        TrackType: { TEXT: "TEXT" },
        TextTrackType: { SUBTITLES: "SUBTITLES" },
        StreamType: { BUFFERED: "BUFFERED" },
        HlsSegmentFormat: { TS: "ts" },
        HlsVideoSegmentFormat: { MPEG2_TS: "mpeg2_ts" },
        EditTracksInfoRequest: class {
          constructor(public activeTrackIds: number[]) {}
        },
      },
    },
  });
  return { player, session, context, controller, mediaSession, emit, setState };
}

/** Clicks the cast button once the sender has loaded, and lets the receiver answer. */
const castNow = async () => {
  const button = await screen.findByRole("button", { name: "cast" });

  await act(async () => fireEvent.click(button));
};

const show = (props: Partial<Parameters<typeof VideoPlayer>[0]> = {}) =>
  render(
    <VideoPlayer
      videoId="v9"
      title="Nobel"
      masterUrl={MASTER}
      subtitles={SUBTITLES}
      chapters={CHAPTERS}
      durationSeconds={120}
      cast
      {...props}
    />
  );

describe("casting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCast();
    vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue("maybe");
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ left: 0, width: 200 } as DOMRect);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.head.querySelectorAll("script").forEach((script) => script.remove());
  });

  it("loads Google's sender only in browsers that can cast, and with the default receiver", async () => {
    await expect(loadCast()).resolves.toBe(false);
    expect(document.head.querySelector("script")).toBeNull();

    resetCast();
    vi.stubGlobal("chrome", {});

    const loaded = loadCast();
    const script = document.head.querySelector("script");

    expect(script).toHaveAttribute("src", CAST_SENDER_URL);

    const { context } = installCast();

    (window as unknown as { __onGCastApiAvailable: (available: boolean) => void }).__onGCastApiAvailable(true);
    await expect(loaded).resolves.toBe(true);
    expect(context.setOptions).toHaveBeenCalledWith({
      receiverApplicationId: "CC1AD845",
      autoJoinPolicy: "origin_scoped",
    });
    expect(loadCast()).toBe(loaded);
  });

  it("says the browser cannot cast when the sender does not load", async () => {
    vi.stubGlobal("chrome", {});

    const loaded = loadCast();

    fireEvent.error(document.head.querySelector("script") as HTMLScriptElement);
    await expect(loaded).resolves.toBe(false);
  });

  it("shows no cast button when casting is off or no receiver is near", async () => {
    const { context } = installCast("NO_DEVICES_AVAILABLE");
    const { rerender } = show({ cast: false });

    await act(async () => undefined);
    expect(screen.queryByRole("button", { name: "cast" })).not.toBeInTheDocument();
    expect(context.setOptions).not.toHaveBeenCalled();

    rerender(
      <VideoPlayer
        videoId="v9"
        title="Nobel"
        masterUrl={MASTER}
        subtitles={SUBTITLES}
        chapters={CHAPTERS}
        durationSeconds={120}
        cast
      />
    );
    await waitFor(() => expect(context.setOptions).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "cast" })).not.toBeInTheDocument();
  });

  it("casts the signed stream with its subtitles from where playing got to, and becomes the receiver's remote", async () => {
    const { player, session, controller, mediaSession, emit } = installCast();
    const onTime = vi.fn();
    const { container } = show({ onTime });
    const element = container.querySelector("video") as HTMLVideoElement;

    act(() => {
      element.currentTime = 30;
      fireEvent.timeUpdate(element);
    });
    fireEvent.click(screen.getByRole("button", { name: "subtitles" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /Svenska/ }));
    await castNow();

    const request = session.loadMedia.mock.calls[0][0] as unknown as Record<string, unknown> & {
      media: Record<string, unknown> & { tracks: Record<string, unknown>[]; metadata: Record<string, unknown> };
    };

    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(request.media.contentId).toBe(MASTER);
    expect(request.media.contentType).toBe("application/vnd.apple.mpegurl");
    expect(request.media.hlsSegmentFormat).toBe("ts");
    expect(request.media.customData).toEqual({ videoId: "v9" });
    expect(request.media.metadata.title).toBe("Nobel");
    expect(request.media.metadata.images).toEqual([{ url: "https://media.test/v/9/sig/1/3/poster.jpg" }]);
    expect(
      request.media.tracks.map((track) => [track.trackId, track.trackContentId, track.language, track.subtype])
    ).toEqual([
      [1, SUBTITLES[0].url, "sv", "SUBTITLES"],
      [2, SUBTITLES[1].url, "en", "SUBTITLES"],
    ]);
    expect(request.currentTime).toBe(30);
    expect(request.activeTrackIds).toEqual([1]);
    expect(screen.getByRole("status")).toHaveTextContent('castingTo:{"device":"Vardagsrummet"}');
    expect(screen.getByRole("button", { name: "stopCasting" })).toHaveAttribute("aria-pressed", "true");

    // The receiver's time drives the timeline, the chapter and the saved progress
    act(() => {
      player.currentTime = 65;
      emit();
    });
    expect(onTime).toHaveBeenLastCalledWith(65);
    expect(screen.getByRole("slider", { name: "timeline" })).toHaveAttribute("aria-valuenow", "65");
    expect(screen.getByRole("status")).toHaveTextContent("Första akten");
    expect(saveProgressAction).toHaveBeenLastCalledWith("v9", 65);

    // Play and pause, seeking and subtitles go to the receiver
    act(() => fireEvent.click(screen.getByRole("button", { name: "pause" })));
    expect(controller.playOrPause).toHaveBeenCalledTimes(1);
    // Where casting started, where the receiver got to, and where it paused
    expect(saveProgressAction).toHaveBeenCalledTimes(3);
    fireEvent.click(screen.getByRole("slider", { name: "timeline" }), { clientX: 50 });
    expect(player.currentTime).toBe(30);
    expect(controller.seek).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "back" }));
    expect(player.currentTime).toBe(20);
    fireEvent.click(screen.getByRole("button", { name: "subtitles" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /English/ }));
    expect(mediaSession.editTracksInfo.mock.calls[0][0]).toEqual({ activeTrackIds: [2] });
  });

  it("goes on playing here where the receiver was when casting stops", async () => {
    const { player, context, emit } = installCast();
    const { container } = show();
    const element = container.querySelector("video") as HTMLVideoElement;

    await castNow();
    act(() => {
      player.currentTime = 42;
      emit();
    });
    act(() => fireEvent.click(screen.getByRole("button", { name: "stopCasting" })));

    expect(context.endCurrentSession).toHaveBeenCalledWith(true);
    expect(element.currentTime).toBe(42);
    expect(saveProgressAction).toHaveBeenLastCalledWith("v9", 42);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "cast" })).toBeInTheDocument();
  });

  it("tells the page when the video has played to its end on the receiver", async () => {
    const { player, emit } = installCast();
    const onEnded = vi.fn();

    show({ onEnded });
    await castNow();
    act(() => {
      player.currentTime = 119;
      emit();
    });
    act(() => {
      Object.assign(player, { playerState: "IDLE", mediaInfo: null });
      emit();
    });
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("plays the next video on the receiver when it is still connected", async () => {
    const { session } = installCast("CONNECTED");

    show({ autoPlay: true, startAt: 0 });
    await waitFor(() => expect(session.loadMedia).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("status")).toHaveTextContent("Vardagsrummet");
  });

  it("does nothing when the viewer closes the list of receivers", async () => {
    const { context, session } = installCast();

    context.requestSession.mockRejectedValueOnce(new Error("cancel"));
    show();
    await castNow();
    expect(session.loadMedia).not.toHaveBeenCalled();
  });
});

describe("the chapters menu", () => {
  beforeEach(() => {
    resetCast();
    vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue("maybe");
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists the chapters like episodes and jumps to one", async () => {
    const { container } = show({ cast: false });

    fireEvent.click(screen.getByRole("button", { name: "chapters" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /Första akten/ }));
    expect((container.querySelector("video") as HTMLVideoElement).currentTime).toBe(60);
  });
});
