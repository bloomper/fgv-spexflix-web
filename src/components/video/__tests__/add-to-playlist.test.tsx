import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddToPlaylistMenu } from "@/components/video/add-to-playlist.client";

const actions = vi.hoisted(() => ({ addToPlaylistAction: vi.fn(), createPlaylistAction: vi.fn() }));
const dialogs = vi.hoisted(() => ({ prompt: vi.fn(), confirm: vi.fn() }));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
const track = vi.hoisted(() => vi.fn());

vi.mock("@/components/video/actions.server", () => actions);
vi.mock("@/components/dialogs.client", () => ({ useDialogs: () => dialogs }));
vi.mock("sonner", () => ({ toast }));
vi.mock("@/utils/umami", () => ({ track }));

const PLAYLISTS = [{ id: "p1", name: "Bästa numren" }];

describe("AddToPlaylistMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds the whole video to one of the user's playlists", async () => {
    actions.addToPlaylistAction.mockResolvedValue({ ok: true, data: null });
    render(<AddToPlaylistMenu videoId="v1" playlists={PLAYLISTS} label="filmen" />);

    await userEvent.click(screen.getByRole("button", { name: /addToPlaylist/ }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Bästa numren" }));

    await waitFor(() => expect(actions.addToPlaylistAction).toHaveBeenCalledWith("p1", "v1", null));
    expect(toast.success).toHaveBeenCalledWith("videoAdded");
    expect(track).toHaveBeenCalledWith("playlist-add", { clip: false, created: false });
  });

  it("adds a chapter as a clip to a new playlist, from a small button", async () => {
    dialogs.prompt.mockResolvedValue("  Nya listan  ");
    actions.createPlaylistAction.mockResolvedValue({ ok: true, data: "p2" });
    render(<AddToPlaylistMenu videoId="v1" startSeconds={20} playlists={[]} label="Kärleksduetten" compact />);

    await userEvent.click(screen.getByRole("button", { name: /addClip:.*Kärleksduetten/ }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "newPlaylist" }));

    await waitFor(() => expect(actions.createPlaylistAction).toHaveBeenCalledWith("Nya listan", { videoId: "v1", startSeconds: 20 }));
    expect(toast.success).toHaveBeenCalledWith("clipAdded");
    expect(track).toHaveBeenCalledWith("playlist-add", { clip: true, created: true });
  });

  it("does nothing when the new playlist gets no name, and shows the server's refusal", async () => {
    dialogs.prompt.mockResolvedValueOnce("  ");
    actions.addToPlaylistAction.mockResolvedValue({ ok: false, code: "BAD_REQUEST", message: "Spellistan är full." });
    render(<AddToPlaylistMenu videoId="v1" playlists={PLAYLISTS} label="filmen" />);

    await userEvent.click(screen.getByRole("button", { name: /addToPlaylist/ }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "newPlaylist" }));
    await waitFor(() => expect(dialogs.prompt).toHaveBeenCalled());
    expect(actions.createPlaylistAction).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: /addToPlaylist/ }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Bästa numren" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Spellistan är full."));

    dialogs.prompt.mockResolvedValueOnce("Ny");
    actions.createPlaylistAction.mockResolvedValue({ ok: false, code: "BAD_REQUEST", message: "Du kan ha högst 200 spellistor." });
    await userEvent.click(screen.getByRole("button", { name: /addToPlaylist/ }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "newPlaylist" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Du kan ha högst 200 spellistor."));
  });
});
