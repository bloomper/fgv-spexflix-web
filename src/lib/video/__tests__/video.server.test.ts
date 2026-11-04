import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as video from "@/lib/video/video.server";

const { runQuery, runMutation } = vi.hoisted(() => ({ runQuery: vi.fn(), runMutation: vi.fn() }));

vi.mock("@/lib/graphql.server", () => ({ runQuery, runMutation }));

const variables = (mock: typeof runQuery) => mock.mock.calls.at(-1)?.[1];

describe("the video client", () => {
  beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("unwraps single results and falls back when the server answers nothing", async () => {
    runQuery.mockResolvedValueOnce({ video: { id: "1" } });
    expect(await video.getVideo("1")).toEqual({ id: "1" });
    expect(variables(runQuery)).toEqual({ id: "1" });
    runQuery.mockResolvedValueOnce(undefined);
    expect(await video.getVideo("2")).toBeNull();

    runQuery.mockResolvedValueOnce({ playback: { masterUrl: "https://media.test/m.m3u8" } });
    expect(await video.getPlayback("1")).toEqual({ masterUrl: "https://media.test/m.m3u8" });
    expect(variables(runQuery)).toEqual({ videoId: "1" });
    runQuery.mockResolvedValueOnce(undefined);
    expect(await video.getPlayback("1")).toBeNull();
  });

  it.each([
    ["search", ["revy"], "search", { q: "revy" }],
    ["getWatchList", [], "watchList", {}],
    ["searchSpex", ["Ali"], "spexSearch", { q: "Ali" }],
    ["getSpexifyTracks", ["4"], "spexifyTracks", { videoId: "4" }],
  ] as const)("%s returns a list, empty when the server answers nothing", async (name, args, field, expected) => {
    const call = video[name] as (...a: unknown[]) => Promise<unknown>;

    runQuery.mockResolvedValueOnce({ [field]: [{ id: "x" }] });
    expect(await call(...args)).toEqual([{ id: "x" }]);
    expect(variables(runQuery)).toEqual(expected);

    runQuery.mockResolvedValueOnce(undefined);
    expect(await call(...args)).toEqual([]);
  });

  it("passes the page queries through", async () => {
    runQuery.mockResolvedValue({ me: { username: "user" } });
    expect(await video.getMe()).toEqual({ me: { username: "user" } });
    await video.getHome();
    await video.getVideos({ year: "1990" } as never);
    expect(variables(runQuery)).toEqual({ filter: { year: "1990" } });
  });

  it("returns the created video", async () => {
    runMutation.mockResolvedValueOnce({ videoCreate: { id: "9" } });
    expect(await video.videoCreate({ title: "Ny" } as never)).toEqual({ id: "9" });
  });

  it.each([
    ["videoUpdate", ["1", { title: "A" }], { id: "1", input: { title: "A" } }],
    ["videoSetFile", ["1", "up-1"], { id: "1", uploadId: "up-1" }],
    ["videoPublish", ["1", true], { id: "1", published: true }],
    ["videoTrash", ["1"], { id: "1" }],
    ["videoRestore", ["1"], { id: "1" }],
    ["videoDelete", ["1"], { id: "1" }],
    ["videoPosterFrame", ["1", 42], { id: "1", seconds: 42 }],
    ["videoReprocess", ["1"], { id: "1" }],
    ["chaptersSet", ["1", [{ startSeconds: 0, title: "Ouvertyr" }]], {
      videoId: "1",
      chapters: [{ startSeconds: 0, title: "Ouvertyr" }],
    }],
    ["subtitleRemove", ["1", "sv"], { videoId: "1", language: "sv" }],
    ["progressSave", ["1", 90], { videoId: "1", positionSeconds: 90 }],
    ["watchListAdd", ["1"], { videoId: "1" }],
    ["watchListRemove", ["1"], { videoId: "1" }],
  ] as const)("%s sends its variables", async (name, args, expected) => {
    runMutation.mockResolvedValueOnce({});
    await (video[name] as (...a: unknown[]) => Promise<unknown>)(...args);
    expect(variables(runMutation)).toEqual(expected);
  });

  it("gives Spexify's address without a trailing slash, or null", () => {
    vi.stubEnv("SPEXIFY_WEB_URL", "https://spexify.test/");
    expect(video.spexifyUrl()).toBe("https://spexify.test");

    vi.stubEnv("SPEXIFY_WEB_URL", "");
    expect(video.spexifyUrl()).toBeNull();
  });
});
