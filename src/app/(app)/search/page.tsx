import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <form method="get" action="/search" role="search" className="flex max-w-xl gap-2">
          <Input key={q} name="q" type="search" defaultValue={q} maxLength={200} placeholder={t("placeholder")}
                 aria-label={t("query")} />
          <Button type="submit">{t("title")}</Button>
        </form>
        {!videos && <p className="text-muted-foreground">{t("hint")}</p>}
        {videos?.length === 0 && <p className="text-muted-foreground">{t("none")}</p>}
        {videos && videos.length > 0 && <VideoGrid videos={videos} />}
      </div>
    );
  });
}
