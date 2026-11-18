import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Backdrop } from "@/components/video/backdrop";
import { EpisodeList } from "@/components/video/episode-list";
import { TitlePlay } from "@/components/video/title-actions";
import { getCollection } from "@/lib/video/video.server";
import { isEditor } from "@/utils/auth";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@/components/data-empty";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A collection's title page: a backdrop with its description, Play (which goes on with the first video not watched to
 * the end), and its videos in order as episodes.
 */
export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async (authz) => {
    const { id } = await params;

    if (!ID.test(id)) {
      notFound();
    }

    const t = await getTranslations("Collections");
    const tt = await getTranslations("Title");
    const collection = await getCollection(id);

    if (!collection) {
      notFound();
    }

    return (
      <div className="flex flex-1 flex-col pb-10">
        <Backdrop videoId={collection.videos[0]?.id} title={collection.title}>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">{tt("collection")}</p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">{collection.title}</h1>
          <p className="text-sm text-muted-foreground">{tt("videos", { count: collection.videos.length })}</p>
          {collection.description &&
            <p className="line-clamp-4 max-w-2xl whitespace-pre-line text-pretty">{collection.description}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <TitlePlay videos={collection.videos} />
            {isEditor(authz.roles) && (
              <Button size="lg" variant="ghost" nativeButton={false}
                      render={<Link href={`/manage/collections/${collection.id}`} />}>
                <Pencil />{t("edit")}
              </Button>
            )}
          </div>
        </Backdrop>
        <div className="max-w-5xl px-4 md:px-10">
          {collection.videos.length > 0
            ? <EpisodeList videos={collection.videos} label={collection.title} />
            : <DataEmpty title={t("empty")} description={null} />}
        </div>
      </div>
    );
  });
}
