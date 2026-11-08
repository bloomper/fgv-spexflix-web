import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { VideoGrid } from "@/components/video/video-grid";
import { getCreditVideos } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@/components/data-empty";

/**
 * The videos a name takes part in, newest first, each with what the name does or plays there.
 */
export default async function CreditPage({ params }: { params: Promise<{ name: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const name = decodeURIComponent((await params).name).trim();

    if (!name || name.length > 255) {
      notFound();
    }

    const t = await getTranslations("Credits");
    const entries = await getCreditVideos(name);
    const roles = new Map(entries.map(entry => [entry.video.id, entry.role]));

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="space-y-1">
          <Link href="/credits" className="text-sm text-primary hover:text-primary/80">{t("all")}</Link>
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="text-sm text-muted-foreground">{t("videos", { count: entries.length })}</p>
        </div>
        {entries.length === 0 ? <DataEmpty title={t("nothing")} description={null} /> : (
          <VideoGrid videos={entries.map(entry => entry.video)}
                     label={video => roles.get(video.id) ?? null} />
        )}
      </div>
    );
  });
}
