import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Pencil, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoGrid } from "@/components/video/video-grid";
import { getCollection } from "@/lib/video/video.server";
import { isEditor } from "@/utils/auth";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@/components/data-empty";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async (authz) => {
    const { id } = await params;

    if (!ID.test(id)) {
      notFound();
    }

    const t = await getTranslations("Collections");
    const collection = await getCollection(id);

    if (!collection) {
      notFound();
    }

    // Where to go on: the first video not watched to the end, else the first
    const upNext = collection.videos.find(video => !video.finished && video.status === "READY") ?? collection.videos[0];

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{collection.title}</h1>
          {collection.description &&
            <p className="max-w-prose whitespace-pre-line text-sm text-muted-foreground">{collection.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {upNext && (
            <Button nativeButton={false} render={<Link href={`/videos/${upNext.id}`} />}>
              <Play />{upNext === collection.videos[0] ? t("playFromStart") : t("continue", { title: upNext.title })}
            </Button>
          )}
          {isEditor(authz.roles) && (
            <Button variant="ghost" nativeButton={false}
                    render={<Link href={`/manage/collections/${collection.id}`} />}>
              <Pencil />{t("edit")}
            </Button>
          )}
        </div>
        {collection.videos.length > 0 ? <VideoGrid videos={collection.videos} /> :
          <DataEmpty title={t("empty")} description={null} />}
      </div>
    );
  });
}
