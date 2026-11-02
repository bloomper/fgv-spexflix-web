import {createRef} from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {type PlayerHandle, VideoPlayer} from "@/components/video/video-player.client";

const saveProgressAction = vi.hoisted(() => vi.fn());
const trackEvent = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());
const hls = vi.hoisted(() => ({
    supported: true,
    instances: [] as {
        options: object;
        loadSource: ReturnType<typeof vi.fn>;
        attachMedia: ReturnType<typeof vi.fn>;
        destroy: ReturnType<typeof vi.fn>;
        recoverMediaError: ReturnType<typeof vi.fn>;
        emit: (data: { fatal: boolean; type: string }) => void;
        emitManifest: (levels: { height: number; bitrate: number }[]) => void;
        currentLevel: number;
    }[],
}));

vi.mock("@/components/video/actions.server", () => ({saveProgressAction}));
vi.mock("@/utils/umami", () => ({track: trackEvent}));
vi.mock("next/navigation", () => ({useRouter: () => ({refresh})}));
vi.mock("hls.js", () => {
    class FakeHls {
        static isSupported = () => hls.supported;
        static Events = {ERROR: "hlsError", MANIFEST_PARSED: "hlsManifestParsed"};
        static ErrorTypes = {NETWORK_ERROR: "networkError", MEDIA_ERROR: "mediaError"};
        loadSource = vi.fn();
        attachMedia = vi.fn();
        destroy = vi.fn();
        recoverMediaError = vi.fn();
        currentLevel = -1;
        listeners: { event: string; listener: (event: string, data: never) => void }[] = [];
        on = (event: string, listener: (event: string, data: never) => void) => this.listeners.push({event, listener});
        fire = (event: string, data: unknown) => this.listeners.filter(entry => entry.event === event)
            .forEach(entry => entry.listener(event, data as never));
        emit = (data: { fatal: boolean; type: string }) => this.fire("hlsError", data);
        emitManifest = (levels: { height: number; bitrate: number }[]) => this.fire("hlsManifestParsed", {levels});

        constructor(public options: object) {
            hls.instances.push(this);
        }
    }

    return {default: FakeHls};
});

const MASTER = "https://media.test/v/1/master.m3u8";
const THUMBS = "https://media.test/v/1/thumbs/thumbs.vtt";
const CHAPTERS = [{startSeconds: 0, title: "Ouvertyr"}, {startSeconds: 60, title: "Första akten"}];

const show = (props: Partial<Parameters<typeof VideoPlayer>[0]> = {}) => render(
    <VideoPlayer videoId="1" masterUrl={MASTER} subtitles={[{language: "sv", label: "Svenska", url: "https://media.test/sv.vtt"}]}
                 chapters={CHAPTERS} durationSeconds={120} {...props}/>);

const media = (container: HTMLElement) => container.querySelector("video") as HTMLVideoElement;
const timeline = () => screen.getByRole("slider", {name: "timeline"});

/** jsdom does not play media: move the clock and fire the event the browser would. */
const playTo = (element: HTMLVideoElement, seconds: number) => act(() => {
    element.currentTime = seconds;
    fireEvent.timeUpdate(element);
});

describe("VideoPlayer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        hls.supported = true;
        hls.instances = [];
        vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue("");
        vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({left: 0, width: 200} as DOMRect);
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
            "WEBVTT\n\n00:00:00.000 --> 00:01:00.000\nsprite.jpg#xywh=0,0,160,90\n\n00:01:00.000 --> 00:02:00.000\nsprite.jpg#xywh=160,0,160,90\n")));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("plays through hls.js where the browser cannot play HLS, and stops it on unmount", async () => {
        const {container, unmount} = show({startAt: 30});

        await waitFor(() => expect(hls.instances).toHaveLength(1));
        expect(hls.instances[0].options).toEqual({startPosition: 30});
        expect(hls.instances[0].loadSource).toHaveBeenCalledWith(MASTER);
        expect(hls.instances[0].attachMedia).toHaveBeenCalledWith(media(container));
        expect(media(container).getAttribute("poster")).toBe("/api/poster/1");
        expect(container.querySelector("track")).toHaveAttribute("srclang", "sv");

        unmount();
        expect(hls.instances[0].destroy).toHaveBeenCalled();
    });

    it("says when hls.js gives up, and tries again from where playing stopped with fresh addresses", async () => {
        const {container} = show({startAt: 30});

        await waitFor(() => expect(hls.instances).toHaveLength(1));
        act(() => hls.instances[0].emit({fatal: false, type: "networkError"}));
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();

        playTo(media(container), 50);
        act(() => hls.instances[0].emit({fatal: true, type: "networkError"}));
        expect(screen.getByRole("alert")).toHaveTextContent("error");
        expect(hls.instances[0].destroy).toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", {name: "retry"}));
        expect(refresh).toHaveBeenCalled();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        await waitFor(() => expect(hls.instances).toHaveLength(2));
        expect(hls.instances[1].options).toEqual({startPosition: 50});
    });

    it("recovers once from a media error before giving up", async () => {
        show();

        await waitFor(() => expect(hls.instances).toHaveLength(1));
        act(() => hls.instances[0].emit({fatal: true, type: "mediaError"}));
        expect(hls.instances[0].recoverMediaError).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();

        act(() => hls.instances[0].emit({fatal: true, type: "mediaError"}));
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("says when Safari cannot play the video", () => {
        vi.mocked(HTMLMediaElement.prototype.canPlayType).mockReturnValue("maybe");
        const {container} = show();

        fireEvent.error(media(container));
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("plays natively in Safari and starts at the given position", () => {
        vi.mocked(HTMLMediaElement.prototype.canPlayType).mockReturnValue("maybe");
        const {container} = show({startAt: 45});
        const element = media(container);

        expect(element.src).toBe(MASTER);
        fireEvent.loadedMetadata(element);
        expect(element.currentTime).toBe(45);
        expect(hls.instances).toHaveLength(0);
    });

    it("falls back to the plain address when hls.js is not supported either", async () => {
        hls.supported = false;
        const {container} = show();

        await waitFor(() => expect(media(container).src).toBe(MASTER));
        expect(hls.instances).toHaveLength(0);
    });

    it("saves progress every 15 seconds and on pause, and counts the first play only", () => {
        const {container} = show();
        const element = media(container);

        playTo(element, 10);
        expect(saveProgressAction).not.toHaveBeenCalled();
        playTo(element, 16);
        expect(saveProgressAction).toHaveBeenLastCalledWith("1", 16);
        playTo(element, 20);
        expect(saveProgressAction).toHaveBeenCalledTimes(1);

        fireEvent.pause(element);
        expect(saveProgressAction).toHaveBeenLastCalledWith("1", 20);

        fireEvent.play(element);
        fireEvent.play(element);
        expect(trackEvent).toHaveBeenCalledTimes(1);
        expect(trackEvent).toHaveBeenCalledWith("video-play");
    });

    it("does not record progress for an editor's preview", () => {
        const {container} = show({recordProgress: false});

        playTo(media(container), 30);
        fireEvent.ended(media(container));
        expect(saveProgressAction).not.toHaveBeenCalled();
    });

    it("shows the time and chapter, and seeks from the timeline by mouse and keyboard", () => {
        const {container} = show();
        const element = media(container);

        playTo(element, 65);
        expect(timeline()).toHaveAttribute("aria-valuenow", "65");
        expect(screen.getByText("1:05 · Första akten")).toBeInTheDocument();
        expect(screen.getByText("2:00")).toBeInTheDocument();

        fireEvent.keyDown(timeline(), {key: "ArrowRight"});
        expect(element.currentTime).toBe(75);
        fireEvent.keyDown(timeline(), {key: "ArrowLeft"});
        expect(element.currentTime).toBe(55);

        fireEvent.click(timeline(), {clientX: 50});
        expect(element.currentTime).toBe(30);
    });

    it("previews the thumbnail and chapter under the pointer", async () => {
        const {container} = show({thumbnailsUrl: THUMBS});

        await waitFor(() => expect(fetch).toHaveBeenCalledWith(THUMBS));
        await act(async () => undefined);

        fireEvent.mouseMove(timeline(), {clientX: 150});
        expect(screen.getByText("1:30")).toBeInTheDocument();
        expect(screen.getByText("Första akten")).toBeInTheDocument();

        const sprite = container.querySelector("[style*='background-image']") as HTMLElement;

        expect(sprite.style.backgroundImage).toContain("https://media.test/v/1/thumbs/sprite.jpg");
        expect(sprite.style.backgroundPosition).toBe("-160px 0px");

        fireEvent.mouseLeave(timeline());
        expect(screen.queryByText("1:30")).not.toBeInTheDocument();
    });

    it("takes the real duration when the media knows it", () => {
        const {container} = show();
        const element = media(container);

        Object.defineProperty(element, "duration", {value: 180, configurable: true});
        fireEvent.durationChange(element);
        expect(screen.getByText("3:00")).toBeInTheDocument();
        expect(timeline()).toHaveAttribute("aria-valuemax", "180");
    });

    it("lets the page seek and read the position", () => {
        const ref = createRef<PlayerHandle>();
        const {container} = show({ref});

        act(() => ref.current?.seek(90));
        expect(media(container).currentTime).toBe(90);
        expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
        expect(ref.current?.currentTime()).toBe(90);
    });

    it("offers the quality levels hls.js found and picks one, or lets hls.js choose again", async () => {
        const {container} = show();

        await waitFor(() => expect(hls.instances).toHaveLength(1));
        act(() => hls.instances[0].emitManifest([{height: 360, bitrate: 800_000}, {height: 720, bitrate: 2_500_000}]));

        const quality = screen.getByRole("combobox");

        fireEvent.change(quality, {target: {value: "1"}});
        expect(hls.instances[0].currentLevel).toBe(1);
        fireEvent.change(quality, {target: {value: "-1"}});
        expect(hls.instances[0].currentLevel).toBe(-1);
        expect(media(container)).toHaveAttribute("x-webkit-airplay", "allow");
    });

    it("tells when the video ends and plays at once when asked to", async () => {
        const onEnded = vi.fn();
        const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
        const {container} = show({onEnded, autoPlay: true});

        await waitFor(() => expect(hls.instances).toHaveLength(1));
        act(() => hls.instances[0].emitManifest([]));
        expect(play).toHaveBeenCalled();
        act(() => {
            fireEvent.ended(media(container));
        });
        expect(onEnded).toHaveBeenCalled();
    });

    it("plays, seeks and jumps between chapters from the keyboard", async () => {
        const {container} = show();
        const element = media(container);
        const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);

        await waitFor(() => expect(hls.instances).toHaveLength(1));
        fireEvent.keyDown(document.body, {key: "k"});
        expect(play).toHaveBeenCalled();
        element.currentTime = 30;
        fireEvent.keyDown(document.body, {key: "l"});
        expect(element.currentTime).toBe(40);
        fireEvent.keyDown(document.body, {key: "n"});
        expect(element.currentTime).toBe(60);
        fireEvent.keyDown(document.body, {key: "m"});
        expect(element.muted).toBe(true);
        fireEvent.keyDown(document.body, {key: "?"});
        expect(await screen.findByRole("dialog", {name: "title"})).toBeInTheDocument();
    });
});
