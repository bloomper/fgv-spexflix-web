import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { VideoGrid } from "@/components/video/video-grid";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children?: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock("@/components/video/poster-image.client", () => ({ PosterImage: ({ title }: { title: string }) => <img alt={title} /> }));

const KIND = { id: "k1", nameSv: "Föreställning", nameEn: "Show", isDefault: true };

describe("VideoGrid", () => {
  it("shows each video's facts, how far the user has come, everyone's average and the user's like", () => {
    render(
      <VideoGrid
        videos={[
          {
            id: "v1", title: "Nobel", year: 1975, kind: KIND, durationMs: 120_000, progressSeconds: 60, averageRating: 4.5, ratingCount: 2,
            liked: true, spex: [{ categoryName: "Chalmersspexet", revival: true }],
          },
          { id: "v2", title: "Bearbetas", kind: KIND, status: "PROCESSING", published: false, finished: true },
        ]}
        label={(video) => (video.id === "v1" ? "2 gillar" : null)}
        action={(video) => <button type="button">Ta bort {video.title}</button>}
        hrefFor={(id) => `/manage/videos/${id}`}
      />,
    );

    expect(screen.getByRole("link", { name: /Nobel/ })).toHaveAttribute("href", "/manage/videos/v1");
    expect(screen.getByText("1975 · Chalmersspexet · Föreställning")).toBeInTheDocument();
    expect(screen.getByText("2:00")).toBeInTheDocument();
    expect(screen.getByLabelText(/watched:.*"percent":50/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /average:.*"average":"4,5"/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "liked" })).toBeInTheDocument();
    expect(screen.getByText("2 gillar")).toBeInTheDocument();
    expect(screen.getByText("revival")).toBeInTheDocument();
    expect(screen.getByText("unpublished")).toBeInTheDocument();
    expect(screen.getByText("status.PROCESSING")).toBeInTheDocument();
    expect(screen.getByText("seen")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ta bort Bearbetas" })).toBeInTheDocument();
  });
});
