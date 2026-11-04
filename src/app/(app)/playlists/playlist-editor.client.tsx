"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PosterImage } from "@/components/video/poster-image.client";
import {
  createPlaylistAction,
  deletePlaylistAction,
  removeFromPlaylistAction,
  reorderPlaylistAction,
  updatePlaylistAction,
} from "@/components/video/actions.server";
import { useDialogs } from "@/components/dialogs.client";
import { formatDuration } from "@/utils/duration";
import { track } from "@/utils/umami";

export type PlaylistRow = {
  id: string;
  href: string;
  title: string;
  videoId: string;
  videoTitle: string;
  clip: boolean;
  startSeconds: number | null;
  durationSeconds: number;
  year: number | null;
};

/**
 * Creates an empty playlist and opens it.
 */
export function NewPlaylistButton() {
  const t = useTranslations("Playlists");
  const { prompt } = useDialogs();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button disabled={pending} onClick={async () => {
      const name = await prompt({ title: t("newTitle"), label: t("name"), confirmLabel: t("create"), maxLength: 255 });

      if (!name?.trim()) {
        return;
      }
      startTransition(async () => {
        const result = await createPlaylistAction(name.trim());

        if (result.ok && result.data) {
          track("playlist-create");
          router.push(`/playlists/${result.data}`);
        } else if (!result.ok) {
          toast.error(result.message);
        }
      });
    }}>
      <Plus />{t("newTitle")}
    </Button>
  );
}

/**
 * The owner's changes to a playlist: its name, description and whether it is public, and deleting it.
 */
export function PlaylistSettings({ id, name, description, isPublic }: {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean
}) {
  const t = useTranslations("Playlists");
  const { confirm } = useDialogs();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ name, description: description ?? "", isPublic });
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button variant="outline" onClick={() => {
        setValues({ name, description: description ?? "", isPublic });
        setOpen(true);
      }}>
        <Pencil />{t("edit")}
      </Button>
      <Button variant="ghost" disabled={pending} onClick={async () => {
        if (!await confirm({
          title: t("deleteTitle", { name }),
          description: t("deleteText"),
          confirmLabel: t("delete"),
          destructive: true,
        })) {
          return;
        }
        startTransition(async () => {
          const result = await deletePlaylistAction(id);

          if (result.ok) {
            toast.success(t("deleted"));
            router.push("/playlists");
          } else {
            toast.error(result.message);
          }
        });
      }}>
        <Trash2 />{t("delete")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form className="space-y-4" onSubmit={event => {
            event.preventDefault();
            startTransition(async () => {
              const result = await updatePlaylistAction(id, {
                name: values.name.trim(), description: values.description.trim() || null, isPublic: values.isPublic,
              });

              if (result.ok) {
                toast.success(t("saved"));
                setOpen(false);
              } else {
                toast.error(result.message);
              }
            });
          }}>
            <DialogHeader>
              <DialogTitle>{t("edit")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="playlist-name">{t("name")}</Label>
              <Input id="playlist-name" required maxLength={255} value={values.name}
                     onChange={event => setValues({ ...values, name: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="playlist-description">{t("description")}</Label>
              <Textarea id="playlist-description" maxLength={4000} value={values.description}
                        onChange={event => setValues({ ...values, description: event.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={values.isPublic}
                      onCheckedChange={checked => setValues({ ...values, isPublic: checked })} />
              {t("makePublic")}
            </label>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t("cancel")}</Button>
              <Button type="submit" disabled={pending || !values.name.trim()}>{t("save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * A playlist's videos and clips; the owner moves and removes them.
 */
export function PlaylistItems({ playlistId, owned, items }: {
  playlistId: string;
  owned: boolean;
  items: PlaylistRow[]
}) {
  const t = useTranslations("Playlists");
  const [pending, startTransition] = useTransition();

  const run = (work: () => Promise<{ ok: boolean; message?: string }>) => startTransition(async () => {
    const result = await work();

    if (!result.ok) {
      toast.error(result.message ?? "?");
    }
  });
  const move = (from: number, to: number) => {
    const ids = items.map(item => item.id);
    const [moved] = ids.splice(from, 1);

    ids.splice(to, 0, moved);
    run(() => reorderPlaylistAction(playlistId, ids));
  };

  return (
    <ol className="divide-y rounded-lg border">
      {items.map((item, i) => (
        <li key={item.id} className="flex items-center gap-3 px-2 py-2 sm:px-3">
          <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{i + 1}</span>
          <Link href={item.href} className="flex min-w-0 flex-1 items-center gap-3 hover:underline">
            <PosterImage videoId={item.videoId} title={item.videoTitle} className="w-24 shrink-0 rounded" />
            <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{item.title}</span>
                            <span className="block truncate text-xs text-muted-foreground">
                                {[item.clip ? t("clip", { title: item.videoTitle }) : null, item.year,
                                  item.clip && item.startSeconds !== null ? formatDuration(item.startSeconds) : null].filter(Boolean).join(" · ")}
                            </span>
                        </span>
          </Link>
          <span
            className="hidden shrink-0 text-xs tabular-nums text-muted-foreground sm:block">{formatDuration(item.durationSeconds)}</span>
          {owned && (
            <span className="flex shrink-0">
                            <Button variant="ghost" size="icon" disabled={pending || i === 0}
                                    aria-label={t("moveUp", { title: item.title })}
                                    onClick={() => move(i, i - 1)}><ArrowUp /></Button>
                            <Button variant="ghost" size="icon" disabled={pending || i === items.length - 1}
                                    aria-label={t("moveDown", { title: item.title })}
                                    onClick={() => move(i, i + 1)}><ArrowDown /></Button>
                            <Button variant="ghost" size="icon" disabled={pending}
                                    aria-label={t("remove", { title: item.title })}
                                    onClick={() => run(() => removeFromPlaylistAction(playlistId, item.id))}><X /></Button>
                        </span>
          )}
        </li>
      ))}
    </ol>
  );
}
