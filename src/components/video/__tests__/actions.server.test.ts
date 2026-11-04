import { beforeEach, describe, expect, it, vi } from "vitest";
import { GraphQLRequestError } from "@/lib/graphql.server";
import {
  addToPlaylistAction,
  createPlaylistAction,
  deletePlaylistAction,
  likeVideoAction,
  rateVideoAction,
  removeFromPlaylistAction,
  reorderPlaylistAction,
  saveProgressAction,
  setWatchedAction,
  updatePlaylistAction,
  watchListAction,
} from "@/components/video/actions.server";

const api = vi.hoisted(() => ({
  playlistAddItem: vi.fn(),
  playlistCreate: vi.fn(),
  playlistDelete: vi.fn(),
  playlistRemoveItem: vi.fn(),
  playlistReorder: vi.fn(),
  playlistUpdate: vi.fn(),
  progressClear: vi.fn(),
  progressSave: vi.fn(),
  videoLike: vi.fn(),
  videoMarkWatched: vi.fn(),
  videoRate: vi.fn(),
  watchListAdd: vi.fn(),
  watchListRemove: vi.fn(),
}));
const revalidatePath = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@/lib/video/video.server", () => api);
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/utils/policy.server", () => ({ Policies: { app: { requireAccess: vi.fn() } } }));
vi.mock("@/utils/route.server", () => ({
  withPolicyAction: (_policy: unknown, handler: (authz: object) => Promise<unknown>) => handler({}),
}));

const VIDEO = "00000000-0000-7000-8000-000000000001";
const PLAYLIST = "00000000-0000-7000-8000-000000000600";
const ITEM = "00000000-0000-7000-8000-000000000601";

describe("video actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(api).forEach((fn) => fn.mockResolvedValue(undefined));
  });

  it("saves progress rounded, ignores bad input and failures", async () => {
    await saveProgressAction(VIDEO, 12.6);
    expect(api.progressSave).toHaveBeenCalledWith(VIDEO, 13);
    await saveProgressAction("nope", 1);
    await saveProgressAction(VIDEO, Number.NaN);
    expect(api.progressSave).toHaveBeenCalledTimes(1);
    api.progressSave.mockRejectedValueOnce(new Error("down"));
    await expect(saveProgressAction(VIDEO, 5)).resolves.toBeUndefined();
  });

  it("marks watched or forgets the position, and says when it fails", async () => {
    expect(await setWatchedAction(VIDEO, true)).toBe(true);
    expect(api.videoMarkWatched).toHaveBeenCalledWith(VIDEO);
    expect(await setWatchedAction(VIDEO, false)).toBe(true);
    expect(api.progressClear).toHaveBeenCalledWith(VIDEO);
    api.progressClear.mockRejectedValueOnce(new Error("down"));
    expect(await setWatchedAction(VIDEO, false)).toBe(false);
    expect(await setWatchedAction("nope", true)).toBe(false);
  });

  it("changes the watch list without revalidating the video being watched", async () => {
    expect(await watchListAction(VIDEO, true)).toBe(true);
    expect(await watchListAction(VIDEO, false)).toBe(true);
    expect(api.watchListAdd).toHaveBeenCalledWith(VIDEO);
    expect(api.watchListRemove).toHaveBeenCalledWith(VIDEO);
    expect(revalidatePath).not.toHaveBeenCalledWith(`/videos/${VIDEO}`);
    api.watchListAdd.mockRejectedValueOnce(new Error("down"));
    expect(await watchListAction(VIDEO, true)).toBe(false);
    expect(await watchListAction("nope", true)).toBe(false);
  });

  it("rates from 0 to 5 only", async () => {
    expect(await rateVideoAction(VIDEO, 4)).toBe(true);
    expect(api.videoRate).toHaveBeenCalledWith(VIDEO, 4);
    expect(await rateVideoAction(VIDEO, 6)).toBe(false);
    expect(await rateVideoAction(VIDEO, 2.5)).toBe(false);
    api.videoRate.mockRejectedValueOnce(new Error("down"));
    expect(await rateVideoAction(VIDEO, 3)).toBe(false);
  });

  it("likes and unlikes, revalidating only the liked list", async () => {
    expect(await likeVideoAction(VIDEO, true)).toBe(true);
    expect(api.videoLike).toHaveBeenCalledWith(VIDEO, true);
    expect(revalidatePath).toHaveBeenCalledWith("/liked");
    expect(revalidatePath).not.toHaveBeenCalledWith(`/videos/${VIDEO}`);
    api.videoLike.mockRejectedValueOnce(new Error("down"));
    expect(await likeVideoAction(VIDEO, false)).toBe(false);
    expect(await likeVideoAction("nope", true)).toBe(false);
  });
});

describe("playlist actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(api).forEach((fn) => fn.mockResolvedValue(undefined));
  });

  it("creates a playlist, with its first video or clip", async () => {
    api.playlistCreate.mockResolvedValue({ id: PLAYLIST, name: "Bästa numren", itemCount: 0 });

    expect(await createPlaylistAction("Bästa numren", { videoId: VIDEO, startSeconds: 20 })).toEqual({ ok: true, data: PLAYLIST });
    expect(api.playlistCreate).toHaveBeenCalledWith({ name: "Bästa numren", isPublic: false });
    expect(api.playlistAddItem).toHaveBeenCalledWith(PLAYLIST, VIDEO, 20);
    expect(revalidatePath).toHaveBeenCalledWith("/playlists");

    expect(await createPlaylistAction("Tom")).toEqual({ ok: true, data: PLAYLIST });
    expect(api.playlistAddItem).toHaveBeenCalledTimes(1);
    expect((await createPlaylistAction("Fel", { videoId: "nope", startSeconds: null })).ok).toBe(false);
  });

  it("passes on the server's message when it refuses", async () => {
    api.playlistCreate.mockRejectedValue(new GraphQLRequestError("BAD_REQUEST", "Du kan ha högst 200 spellistor."));

    expect(await createPlaylistAction("En till")).toEqual({ ok: false, code: "BAD_REQUEST", message: "Du kan ha högst 200 spellistor." });
  });

  it("updates, deletes, adds to, removes from and reorders a playlist", async () => {
    const input = { name: "Omdöpt", description: null, isPublic: true };

    expect((await updatePlaylistAction(PLAYLIST, input)).ok).toBe(true);
    expect(api.playlistUpdate).toHaveBeenCalledWith(PLAYLIST, input);
    expect(revalidatePath).toHaveBeenCalledWith(`/playlists/${PLAYLIST}`);
    expect((await deletePlaylistAction(PLAYLIST)).ok).toBe(true);
    expect((await addToPlaylistAction(PLAYLIST, VIDEO, null)).ok).toBe(true);
    expect(api.playlistAddItem).toHaveBeenCalledWith(PLAYLIST, VIDEO, null);
    expect((await removeFromPlaylistAction(PLAYLIST, ITEM)).ok).toBe(true);
    expect(api.playlistRemoveItem).toHaveBeenCalledWith(PLAYLIST, ITEM);
    expect((await reorderPlaylistAction(PLAYLIST, [ITEM])).ok).toBe(true);
    expect(api.playlistReorder).toHaveBeenCalledWith(PLAYLIST, [ITEM]);
  });

  it("refuses ids that are not ids, and a start that is not whole seconds", async () => {
    expect((await updatePlaylistAction("nope", { name: "x", description: null, isPublic: false })).ok).toBe(false);
    expect((await deletePlaylistAction("nope")).ok).toBe(false);
    expect((await addToPlaylistAction(PLAYLIST, VIDEO, 1.5)).ok).toBe(false);
    expect((await addToPlaylistAction("nope", VIDEO, null)).ok).toBe(false);
    expect((await removeFromPlaylistAction(PLAYLIST, "nope")).ok).toBe(false);
    expect((await reorderPlaylistAction(PLAYLIST, ["nope"])).ok).toBe(false);
    expect(api.playlistUpdate).not.toHaveBeenCalled();
    expect(api.playlistAddItem).not.toHaveBeenCalled();
  });
});
