import { getTranslations } from "next-intl/server";
import { VideoGrid } from "@/components/video/video-grid";
import { search } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Search");
    const q = ((await searchParams).q ?? "").slice(0, 200);
    const videos = q.trim().length >= 2 ? await search(q) : null;

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{q ? t("resultsFor", { q }) : t("title")}</h1>
        {!videos && <p className="text-muted-foreground">{t("hint")}</p>}
        {videos?.length === 0 && <p className="text-muted-foreground">{t("none")}</p>}
        {videos && videos.length > 0 && <VideoGrid videos={videos} />}
      </div>
    );
  });
}
