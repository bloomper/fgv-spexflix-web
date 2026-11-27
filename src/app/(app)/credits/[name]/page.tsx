import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { VideoGrid } from "@/components/video/video-grid";
import { getCreditVideos } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

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
      <Page variant="content">
        <PageHeader
          title={name}
          eyebrow={<Link href="/credits" className="text-link hover:text-link/80">{t("all")}</Link>}
          description={t("videos", { count: entries.length })}
        />
        {entries.length === 0 ? <DataEmpty title={t("nothing")} description={null} /> : (
          <VideoGrid videos={entries.map(entry => entry.video)}
                     label={video => roles.get(video.id) ?? null} />
        )}
      </Page>
    );
  });
}
