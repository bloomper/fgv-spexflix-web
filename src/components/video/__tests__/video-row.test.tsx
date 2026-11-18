import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { infoHrefOf, VideoRow } from "@/components/video/video-row";

const actions = vi.hoisted(() => ({ watchListAction: vi.fn() }));
const toast = vi.hoisted(() => ({ error: vi.fn() }));
const track = vi.hoisted(() => vi.fn());

vi.mock("next/link", () => ({
  default: ({ children, href, onClick, ...rest }: { children?: ReactNode; href: string; onClick?: (event: unknown) => void }) =>
    <a href={href} onClick={onClick} {...rest}>{children}</a>,
}));
vi.mock("@/components/video/poster-image.client", () => ({ PosterImage: ({ title }: { title: string }) => <span role="img" aria-label={title} /> }));
vi.mock("@/components/video/actions.server", () => actions);
vi.mock("sonner", () => ({ toast }));
vi.mock("@/utils/umami", () => ({ track }));

const KIND = { id: "k1", nameSv: "Föreställning", nameEn: "Show" };
const NOBEL = {
  id: "v1", title: "Nobel", year: 1975, kind: KIND, durationMs: 120_000, progressSeconds: 30, averageRating: 4, ratingCount: 2,
  inWatchList: false, spex: [{ categoryName: "Chalmersspexet", revival: false, familyId: "s1" }],
};

describe("VideoRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.watchListAction.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is a region of cards named by its heading, with a link to all of its kind, and is left out when empty", () => {
    const { container, rerender } = render(
      <VideoRow id="recent" title="Nytt" videos={[NOBEL, { ...NOBEL, id: "v2", title: "Caesar", spex: [] }]}
                more={{ href: "/videos", label: "Visa alla" }}
                action={video => <button type="button">Glöm {video.title}</button>} label={() => "4 av 5"} />);
    const row = screen.getByRole("region", { name: "Nytt" });

    expect(row).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Visa alla" })).toHaveAttribute("href", "/videos");
    expect(screen.getByRole("list", { name: "Nytt" }).children).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /Nobel/ })[0]).toHaveAttribute("href", "/videos/v1");
    expect(screen.getAllByRole("link", { name: "play" })[0]).toHaveAttribute("href", "/videos/v1?autoplay=1");
    expect(screen.getAllByRole("link", { name: "moreInfo" }).map(link => link.getAttribute("href"))).toEqual(["/spex/s1", "/videos/v2"]);
    expect(screen.getAllByText("1975 · Föreställning · 2:00")).toHaveLength(2);
    expect(screen.getAllByLabelText(/watched:.*"percent":25/)).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Glöm Caesar" })).toBeInTheDocument();
    expect(screen.getAllByText("4 av 5")).toHaveLength(2);

    rerender(<VideoRow id="recent" title="Nytt" videos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("saves the video in the watch list from the card, and takes it back when that fails", async () => {
    render(<VideoRow id="recent" title="Nytt" videos={[NOBEL]} />);
    const toggle = screen.getByRole("button", { name: "myList" });

    await act(async () => fireEvent.click(toggle));
    expect(actions.watchListAction).toHaveBeenCalledWith("v1", true);
    expect(track).toHaveBeenCalledWith("watch-list", { listed: true });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    actions.watchListAction.mockResolvedValueOnce(false);
    await act(async () => fireEvent.click(toggle));
    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "true"));
    expect(toast.error).toHaveBeenCalledWith("myListFailed");
  });

  it("grows on a long press, without opening the video, until a tap elsewhere", () => {
    vi.useFakeTimers();
    const { container } = render(<VideoRow id="recent" title="Nytt" videos={[NOBEL]} />);
    const card = container.querySelector("[class*='group/card']") as HTMLElement;
    const link = screen.getByRole("link", { name: /Nobel/ });

    fireEvent.touchStart(card);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(card).toHaveAttribute("data-expanded", "true");

    const click = new MouseEvent("click", { bubbles: true, cancelable: true });

    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);

    fireEvent.pointerDown(document.body);
    expect(card).not.toHaveAttribute("data-expanded");

    // A short tap is a tap
    fireEvent.touchStart(card);
    fireEvent.touchEnd(card);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    const tap = new MouseEvent("click", { bubbles: true, cancelable: true });

    link.dispatchEvent(tap);
    expect(tap.defaultPrevented).toBe(false);
    expect(card).not.toHaveAttribute("data-expanded");
  });

  it("scrolls sideways with its arrows", () => {
    render(<VideoRow id="recent" title="Nytt" videos={[NOBEL]} />);
    const list = screen.getByRole("list", { name: "Nytt" });
    const scrollBy = vi.fn();

    Object.assign(list, { scrollBy });
    Object.defineProperty(list, "clientWidth", { value: 1000 });
    fireEvent.click(screen.getByRole("button", { name: /scrollForward/ }));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: 850, behavior: "smooth" });
    fireEvent.click(screen.getByRole("button", { name: /scrollBack/ }));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: -850, behavior: "smooth" });
  });

  it("opens the main spex's title page for more info, else the video", () => {
    expect(infoHrefOf(NOBEL)).toBe("/spex/s1");
    expect(infoHrefOf({ ...NOBEL, spex: [] })).toBe("/videos/v1");
  });
});
