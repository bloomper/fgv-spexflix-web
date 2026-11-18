import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { DataEmpty } from "@/components/data-empty";
import { PosterImage } from "@/components/video/poster-image.client";
import { getVideos } from "@/lib/video/video.server";
import { spexFamilies } from "@/utils/spex-families";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

/**
 * Every spex with videos, each opening its title page.
 */
export default async function SpexIndexPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Title");
    const families = spexFamilies((await getVideos({}))?.videos ?? []);

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("allSpex")}</h1>
        {families.length === 0 ? <DataEmpty title={t("noSpex")} description={null} /> : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {families.map(family => (
              <li key={family.id}>
                <Link href={`/spex/${family.id}`} className="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="block overflow-hidden rounded-md shadow-md">
                    <PosterImage videoId={family.videoId} title={family.title}
                                 className="w-full transition-transform duration-200 group-hover:scale-105" />
                  </span>
                  <span className="mt-1.5 block truncate font-medium">{family.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {[family.year, family.categoryName, t("videos", { count: family.count })].filter(Boolean).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  });
}
