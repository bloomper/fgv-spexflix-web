import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Globe, ListVideo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PosterImage } from "@/components/video/poster-image.client";
import { NewPlaylistButton } from "./playlist-editor.client";
import { getPlaylists } from "@/lib/video/video.server";
import { formatDuration } from "@/utils/duration";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@/components/data-empty";

type Summary = Awaited<ReturnType<typeof getPlaylists>>[number];

function PlaylistCards({ playlists }: { playlists: Summary[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {playlists.map(playlist => <PlaylistCard key={playlist.id} playlist={playlist} />)}
    </ul>
  );
}

async function PlaylistCard({ playlist }: { playlist: Summary }) {
  const t = await getTranslations("Playlists");
  const first = playlist.items[0]?.video.id;

  return (
    <li>
      <Link href={`/playlists/${playlist.id}`}
            className="group flex gap-3 rounded-lg border p-2 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
        <div className="w-28 shrink-0 overflow-hidden rounded">
          {first
            ? <PosterImage videoId={first} title={playlist.name} className="w-full" />
            : <div className="flex aspect-video items-center justify-center bg-muted"><ListVideo
              className="size-6 text-muted-foreground" /></div>}
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="truncate font-medium">{playlist.name}</div>
          <div className="text-xs text-muted-foreground">
            {[t("items", { count: playlist.itemCount }), playlist.durationSeconds > 0 ? formatDuration(playlist.durationSeconds) : null].filter(Boolean).join(" · ")}
          </div>
          {!playlist.owned && playlist.ownerName &&
            <div className="truncate text-xs text-muted-foreground">{t("by", { name: playlist.ownerName })}</div>}
          {playlist.owned && playlist.isPublic && <Badge variant="secondary"><Globe />{t("public")}</Badge>}
        </div>
      </Link>
    </li>
  );
}

export default async function PlaylistsPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Playlists");
    const playlists = await getPlaylists();
    const mine = playlists.filter(playlist => playlist.owned);
    const others = playlists.filter(playlist => !playlist.owned);

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="max-w-3xl text-pretty text-sm text-muted-foreground">{t("text")}</p>
          </div>
          <NewPlaylistButton />
        </div>
        <section aria-labelledby="mine" className="space-y-3">
          <h2 id="mine" className="text-lg font-semibold">{t("mine")}</h2>
          {mine.length > 0 ? <PlaylistCards playlists={mine} /> : <DataEmpty title={t("none")} description={null} />}
        </section>
        {others.length > 0 && (
          <section aria-labelledby="others" className="space-y-3">
            <h2 id="others" className="text-lg font-semibold">{t("others")}</h2>
            <PlaylistCards playlists={others} />
          </section>
        )}
      </div>
    );
  });
}
