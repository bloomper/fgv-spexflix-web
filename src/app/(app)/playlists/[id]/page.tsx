import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Globe, Play } from "lucide-react";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { getPlaylist } from "@/lib/video/video.server";
import { formatDuration } from "@/utils/duration";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { PlaylistItems, PlaylistSettings } from "../playlist-editor.client";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

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

    const href = (item: { id: string; video: { id: string } }) =>
      `/videos/${item.video.id}?playlist=${playlist.id}&item=${item.id}`;
    const first = playlist.items[0];

    return (
      <Page variant="content">
        <PageHeader
          title={playlist.name}
          badges={
            playlist.isPublic && (
              <Badge variant="secondary">
                <Globe />
                {t("public")}
              </Badge>
            )
          }
          description={[
            t("items", { count: playlist.itemCount }),
            playlist.durationSeconds > 0 ? formatDuration(playlist.durationSeconds) : null,
            !playlist.owned && playlist.ownerName ? t("by", { name: playlist.ownerName }) : null,
          ]
            .filter(Boolean)
            .join(" · ")}
          actions={
            <>
              {first && (
                <Button
                  nativeButton={false}
                  render={<Link href={`${href(first)}&autoplay=1`} />}
                >
                  <Play />
                  {t("play")}
                </Button>
              )}
              {playlist.owned && (
                <PlaylistSettings
                  id={playlist.id}
                  name={playlist.name}
                  description={playlist.description ?? null}
                  isPublic={playlist.isPublic}
                />
              )}
            </>
          }
        />
        {playlist.description && (
          <p className="max-w-prose text-sm text-pretty whitespace-pre-line">{playlist.description}</p>
        )}
        {playlist.items.length > 0 ? (
          <PlaylistItems
            playlistId={playlist.id}
            owned={playlist.owned}
            items={playlist.items.map((item) => ({
              id: item.id,
              href: href(item),
              title: item.title ?? item.video.title,
              videoId: item.video.id,
              videoTitle: item.video.title,
              clip: item.startSeconds !== null && item.startSeconds !== undefined,
              startSeconds: item.startSeconds ?? null,
              durationSeconds: item.durationSeconds,
              year: item.video.year ?? null,
            }))}
          />
        ) : (
          <DataEmpty
            title={t("empty")}
            description={null}
          />
        )}
      </Page>
    );
  });
}
