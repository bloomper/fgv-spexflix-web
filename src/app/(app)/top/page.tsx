import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LinkTabs } from "@/components/link-tabs";
import { VideoGrid } from "@/components/video/video-grid";
import { getTop } from "@/lib/video/video.server";
import type { TopBy } from "@/gql/graphql";
import { decadesOf, parseDecade } from "@/utils/decades";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { cn } from "@/utils/utils";
import { DataEmpty } from "@/components/data-empty";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BY: TopBy[] = ["RATED", "LIKED", "WATCHED"];

/**
 * Everyone's favourites: the videos with the best weighted average rating, the most likes or the most views to the
 * end, for a decade or a category. What it ranks by is chosen with tabs and the chips below narrow the list; every card
 * says the number it is ranked by.
 */
export default async function TopPage({ searchParams }: {
  searchParams: Promise<{ by?: string; decade?: string; category?: string }>
}) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Top");
    const query = await searchParams;
    const by = BY.find(candidate => candidate === query.by) ?? "RATED";
    const decade = parseDecade(query.decade);
    const categoryId = query.category && ID.test(query.category) ? query.category : null;
    const data = await getTop(by, { categoryId, fromYear: decade, toYear: decade ? decade + 9 : null });
    const current = { by, decade, category: categoryId };
    const link = (changes: Partial<{ by: TopBy; decade: number | null; category: string | null }>) => {
      const params = { ...current, ...changes };
      const search = new URLSearchParams();

      if (params.by !== "RATED") {
        search.set("by", params.by);
      }
      if (params.decade) {
        search.set("decade", String(params.decade));
      }
      if (params.category) {
        search.set("category", params.category);
      }
      return `/top${search.size ? `?${search}` : ""}`;
    };
    const chip = (active: boolean) => cn("rounded-full border px-2.5 py-0.5 text-xs",
      active ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground");
    const videos = data?.topVideos ?? [];
    const counts = new Map(videos.map(video => [video.id, video]));

    return (
      <div className="flex flex-1 flex-col gap-5 p-4 md:p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="max-w-3xl text-pretty text-sm text-muted-foreground">{t(`text.${by}`)}</p>
        </div>
        <LinkTabs label={t("by")} items={BY.map(item => ({
          href: link({ by: item }), label: t(`byLabel.${item}`), active: by === item,
        }))} />
        <nav aria-label={t("filters")} className="space-y-2 pt-1">
          <div className="flex flex-wrap gap-1.5">
            <Link href={link({ category: null })} className={chip(!categoryId)}>{t("allCategories")}</Link>
            {data?.categories.map(item => (
              <Link key={item.id} href={link({ category: item.id })} className={chip(categoryId === item.id)}
                    aria-current={categoryId === item.id ? "page" : undefined}>{item.name}</Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Link href={link({ decade: null })} className={chip(!decade)}>{t("allYears")}</Link>
            {decadesOf(data?.years ?? []).map(item => (
              <Link key={item} href={link({ decade: item })} className={cn(chip(decade === item), "tabular-nums")}
                    aria-current={decade === item ? "page" : undefined}>{t("decade", { decade: item })}</Link>
            ))}
          </div>
        </nav>
        {videos.length > 0
          ? <VideoGrid videos={videos} ranked label={by === "RATED" ? undefined : video => by === "LIKED"
            ? t("likes", { count: counts.get(video.id)?.likeCount ?? 0 })
            : t("watches", { count: counts.get(video.id)?.watchCount ?? 0 })} />
          : <DataEmpty title={t("none")} description={null} />}
      </div>
    );
  });
}
