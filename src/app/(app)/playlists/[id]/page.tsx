import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Globe, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPlaylist } from "@/lib/video/video.server";
import { formatDuration } from "@/utils/duration";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { PlaylistItems, PlaylistSettings } from "../playlist-editor.client";
import { DataEmpty } from "@/components/data-empty";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const { id } = await params;

    if (!ID.test(id)) {
      notFound();
    }

    const t = await getTranslations("Playlists");
    const playlist = await getPlaylist(id);

    if (!playlist) {
      notFound();
    }

    const href = (item: {
      id: string;
      video: { id: string }
    }) => `/videos/${item.video.id}?playlist=${playlist.id}&item=${item.id}`;
    const first = playlist.items[0];

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{playlist.name}</h1>
            {playlist.isPublic && <Badge variant="secondary"><Globe />{t("public")}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {[t("items", { count: playlist.itemCount }), playlist.durationSeconds > 0 ? formatDuration(playlist.durationSeconds) : null,
              !playlist.owned && playlist.ownerName ? t("by", { name: playlist.ownerName }) : null].filter(Boolean).join(" · ")}
          </p>
          {playlist.description &&
            <p className="max-w-3xl whitespace-pre-line text-pretty text-sm">{playlist.description}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            {first && (
              <Button nativeButton={false} render={<Link href={`${href(first)}&autoplay=1`} />}>
                <Play />{t("play")}
              </Button>
            )}
            {playlist.owned && (
              <PlaylistSettings id={playlist.id} name={playlist.name} description={playlist.description ?? null}
                                isPublic={playlist.isPublic} />
            )}
          </div>
        </div>
        {playlist.items.length > 0
          ? <PlaylistItems playlistId={playlist.id} owned={playlist.owned} items={playlist.items.map(item => ({
            id: item.id,
            href: href(item),
            title: item.title ?? item.video.title,
            videoId: item.video.id,
            videoTitle: item.video.title,
            clip: item.startSeconds !== null && item.startSeconds !== undefined,
            startSeconds: item.startSeconds ?? null,
            durationSeconds: item.durationSeconds,
            year: item.video.year ?? null,
          }))} />
          : <DataEmpty title={t("empty")} description={null} />}
      </div>
    );
  });
}
