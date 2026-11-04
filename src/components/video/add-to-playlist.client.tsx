"use client";

import * as React from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ListPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addToPlaylistAction, createPlaylistAction } from "@/components/video/actions.server";
import { useDialogs } from "@/components/dialogs.client";
import { track } from "@/utils/umami";

export type OwnPlaylist = { id: string; name: string };

/**
 * A menu that adds a whole video, or with a start the chapter that starts there (a clip), to one of the user's playlists
 * or to a new one.
 */
export function AddToPlaylistMenu({ videoId, startSeconds = null, playlists, label, compact = false }: {
  videoId: string;
  startSeconds?: number | null;
  playlists: OwnPlaylist[];
  /** What is added, for screen readers, e.g. the chapter's title. */
  label: string;
  /** An icon button, e.g. beside a chapter. */
  compact?: boolean;
}) {
  const t = useTranslations("Playlists");
  const { prompt } = useDialogs();
  const [pending, startTransition] = useTransition();
  const clip = startSeconds !== null;

  const add = (playlistId: string) => startTransition(async () => {
    const result = await addToPlaylistAction(playlistId, videoId, startSeconds);

    if (result.ok) {
      track("playlist-add", { clip, created: false });
      toast.success(clip ? t("clipAdded") : t("videoAdded"));
    } else {
      toast.error(result.message);
    }
  });

  const create = async () => {
    const name = await prompt({ title: t("newTitle"), label: t("name"), confirmLabel: t("create"), maxLength: 255 });

    if (!name?.trim()) {
      return;
    }
    startTransition(async () => {
      const result = await createPlaylistAction(name.trim(), { videoId, startSeconds });

      if (result.ok) {
        track("playlist-add", { clip, created: true });
        toast.success(clip ? t("clipAdded") : t("videoAdded"));
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={pending} render={compact
        ? <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={t("addClip", { title: label })} />
        : <Button variant="outline" />}>
        {compact ? <Plus /> : <><ListPlus />{t("addToPlaylist")}</>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{clip ? t("addClipTo") : t("addVideoTo")}</DropdownMenuLabel>
          {playlists.map(playlist => (
            <DropdownMenuItem key={playlist.id} onClick={() => add(playlist.id)}>
              <ListPlus />{playlist.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {playlists.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem onClick={() => void create()}>
          <Plus />{t("newPlaylist")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
