import type {ReactNode} from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {Watch} from "../watch.client";

const push = vi.hoisted(() => vi.fn());
const actions = vi.hoisted(() => ({
    watchListAction: vi.fn(), setWatchedAction: vi.fn(), saveProgressAction: vi.fn(), likeVideoAction: vi.fn(),
    addToPlaylistAction: vi.fn(), createPlaylistAction: vi.fn(),
}));
const player = vi.hoisted(() => ({props: {} as { onEnded?: () => void; onTime?: (seconds: number) => void; autoPlay?: boolean; startAt?: number | null; endAt?: number | null }}));

vi.mock("next/navigation", () => ({useRouter: () => ({push, refresh: vi.fn()})}));
vi.mock("next/link", () => ({default: ({children, href}: { children?: ReactNode; href: string }) => <a href={href}>{children}</a>}));
vi.mock("@/components/video/actions.server", () => actions);
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));
vi.mock("@/components/dialogs.client", () => ({useDialogs: () => ({prompt: vi.fn(), confirm: vi.fn()})}));
vi.mock("@/components/video/video-player.client", () => ({
    VideoPlayer: (props: typeof player.props) => {
        player.props = props;
        return <div data-testid="player"/>;
    },
}));

const show = (extra: Partial<Parameters<typeof Watch>[0]> = {}) => render(
    <Watch videoId="v1" playback={{masterUrl: "m", subtitles: []}} chapters={[{startSeconds: 0, title: "Ouvertyr"}, {startSeconds: 60, title: "Finalen"}]}
           durationSeconds={120} startAt={0} inWatchList={false} liked={false} finished={false} spexifyUrl={null} recordProgress
           next={{href: "/videos/v2?autoplay=1", title: "Andra akten"}} autoPlay={false} playlists={[]} {...extra}/>);

describe("Watch", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        actions.setWatchedAction.mockResolvedValue(true);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("counts down to the next video when one ends and plays it", () => {
        vi.useFakeTimers();
        show();

        act(() => player.props.onEnded?.());
        expect(screen.getByRole("status")).toHaveTextContent("Andra akten");
        // A second at a time, as each tick schedules the next
        for (let second = 0; second < 10; second++) {
            act(() => {
                vi.advanceTimersByTime(1000);
            });
        }
        expect(push).toHaveBeenCalledWith("/videos/v2?autoplay=1");
    });

    it("lets the viewer cancel the countdown or turn it off", () => {
        vi.useFakeTimers();
        show();

        act(() => player.props.onEnded?.());
        fireEvent.click(screen.getByRole("button", {name: /cancel/}));
        act(() => {
            vi.advanceTimersByTime(15_000);
        });
        expect(push).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("switch"));
        expect(localStorage.getItem("spexflix.autoplay")).toBe("false");
        act(() => player.props.onEnded?.());
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("marks the playing chapter and the video as watched", async () => {
        show();

        act(() => player.props.onTime?.(75));
        expect(screen.getByText("Finalen").closest("li")).toHaveAttribute("aria-current", "true");

        fireEvent.click(screen.getByRole("button", {name: /markWatched/}));
        await waitFor(() => expect(actions.setWatchedAction).toHaveBeenCalledWith("v1", true));
        expect(await screen.findByRole("button", {name: /markUnwatched/})).toBeInTheDocument();
    });

    it("passes on that it should play at once", () => {
        show({autoPlay: true, next: null});

        expect(player.props.autoPlay).toBe(true);
        expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    });
    it("likes the video and takes the like back when it cannot be saved", async () => {
        actions.likeVideoAction.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        show();

        fireEvent.click(screen.getByRole("button", {name: /^like$/}));
        await waitFor(() => expect(actions.likeVideoAction).toHaveBeenCalledWith("v1", true));
        expect(await screen.findByRole("button", {name: /unlike/})).toHaveAttribute("aria-pressed", "true");

        fireEvent.click(screen.getByRole("button", {name: /unlike/}));
        await waitFor(() => expect(actions.likeVideoAction).toHaveBeenLastCalledWith("v1", false));
        expect(await screen.findByRole("button", {name: /unlike/})).toBeInTheDocument();
    });

    it("plays a playlist's clip to its end, then the next item, without marking the video watched", () => {
        vi.useFakeTimers();
        show({
            startAt: 60, endAt: 120, next: {href: "/videos/v3?playlist=p1&item=i2&autoplay=1", title: "Nästa klipp"},
            playlist: {
                id: "p1", name: "Favoritnummer", index: 0, items: [
                    {id: "i1", href: "/videos/v1?playlist=p1&item=i1", title: "Finalen", videoTitle: "Nobel", clip: true, durationSeconds: 60},
                    {id: "i2", href: "/videos/v3?playlist=p1&item=i2", title: "Nästa klipp", videoTitle: "Napoleon", clip: true, durationSeconds: 30},
                ],
            },
        });

        expect(player.props.startAt).toBe(60);
        expect(player.props.endAt).toBe(120);
        expect(screen.getByRole("heading", {name: /Favoritnummer/})).toBeInTheDocument();
        act(() => player.props.onEnded?.());
        for (let second = 0; second < 10; second++) {
            act(() => {
                vi.advanceTimersByTime(1000);
            });
        }
        expect(push).toHaveBeenCalledWith("/videos/v3?playlist=p1&item=i2&autoplay=1");
        expect(screen.getByRole("button", {name: /markWatched/})).toBeInTheDocument();
    });
});
