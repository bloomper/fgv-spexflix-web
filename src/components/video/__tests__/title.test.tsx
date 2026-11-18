import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/video/hero";
import { EpisodeList } from "@/components/video/episode-list";
import { TitlePlay } from "@/components/video/title-actions";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children?: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock("@/components/video/poster-image.client", () => ({
  PosterImage: ({ videoId, title }: { videoId: string; title: string }) => <span role="img" aria-label={title || `still ${videoId}`} />,
}));

const KIND = { id: "k1", nameSv: "Föreställning", nameEn: "Show" };
const video = (id: string, extra = {}) => ({ id, title: `Akt ${id}`, year: 1975, kind: KIND, durationMs: 3_600_000, ...extra });

describe("Hero", () => {
  it("shows the featured video over its still with Play and More info", () => {
    render(<Hero video={video("1", { description: "Hela föreställningen.", spex: [{ categoryName: "Chalmersspexet", familyId: "s1" }] })}>
      <button type="button">Slumpa</button>
    </Hero>);

    expect(screen.getByRole("heading", { level: 1, name: "Akt 1" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "still 1" })).toBeInTheDocument();
    expect(screen.getByText("Hela föreställningen.")).toBeInTheDocument();
    expect(screen.getByText(/1975 · Chalmersspexet · 1:00:00/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "play" })).toHaveAttribute("href", "/videos/1?autoplay=1");
    expect(screen.getByRole("link", { name: "moreInfo" })).toHaveAttribute("href", "/spex/s1");
    expect(screen.getByRole("button", { name: "Slumpa" })).toBeInTheDocument();
  });

  it("says Resume when the viewer has started the video", () => {
    render(<Hero video={video("1", { progressSeconds: 120 })} />);

    expect(screen.getByRole("link", { name: "resume" })).toBeInTheDocument();
  });
});

describe("EpisodeList", () => {
  it("lists the videos as episodes with stills, lengths, progress and descriptions", () => {
    render(<EpisodeList label="Föreställning" videos={[
      video("1", { finished: true, description: "Första akten." }),
      video("2", { progressSeconds: 900, spex: [{ revival: true }] }),
    ]} />);

    const items = screen.getByRole("list", { name: "Föreställning" }).querySelectorAll("li");

    expect(items).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Akt 1/ })).toHaveAttribute("href", "/videos/1?autoplay=1");
    expect(screen.getAllByText("1:00:00")).toHaveLength(2);
    expect(screen.getByText("Första akten.")).toBeInTheDocument();
    expect(screen.getByLabelText(/watched:.*"percent":25/)).toBeInTheDocument();
    expect(screen.getByText("seen")).toBeInTheDocument();
    expect(screen.getByText("revival")).toBeInTheDocument();
  });
});

describe("TitlePlay", () => {
  it("plays from the start, goes on with a started video, or plays the first not watched", () => {
    const { rerender } = render(<TitlePlay videos={[video("1"), video("2")]} />);

    expect(screen.getByRole("link", { name: "play" })).toHaveAttribute("href", "/videos/1?autoplay=1");

    rerender(<TitlePlay videos={[video("1", { finished: true }), video("2", { progressSeconds: 60 })]} />);
    expect(screen.getByRole("link", { name: /resume/ })).toHaveAttribute("href", "/videos/2?autoplay=1");

    rerender(<TitlePlay videos={[video("1", { finished: true }), video("2")]} />);
    expect(screen.getByRole("link", { name: /playNext/ })).toHaveAttribute("href", "/videos/2?autoplay=1");

    rerender(<TitlePlay videos={[]} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
