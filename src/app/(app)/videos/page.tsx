import Link from "next/link";
import {getLocale, getTranslations} from "next-intl/server";
import {VideoGrid} from "@/components/video/video-grid";
import {getVideos} from "@/lib/video/video.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {cn} from "@/utils/utils";
import {kindName} from "@/utils/format";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function VideosPage({searchParams}: { searchParams: Promise<{ category?: string; year?: string; kind?: string; spex?: string }> }) {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations("Videos");
        const locale = await getLocale();
        const {category, year, kind, spex} = await searchParams;
        const categoryId = category && ID.test(category) ? category : null;
        const yearNumber = year && /^\d{4}$/.test(year) ? Number(year) : null;
        const kindValue = kind && ID.test(kind) ? kind : null;
        const spexId = spex && ID.test(spex) ? spex : null;
        const data = await getVideos({categoryId, year: yearNumber, kindId: kindValue, spexId});
        // The spex as the videos have it: the original when the filter is one, else the revival itself.
        const linked = data?.videos.flatMap(video => video.spex);
        const spexTitle = spexId ? (linked?.find(item => item.id === spexId)?.title ?? linked?.find(item => item.familyId === spexId)?.title) : null;
        const link = (params: { category?: string | null; year?: number | null; kind?: string | null; spex?: string | null }) => {
            const query = new URLSearchParams();

            Object.entries(params).forEach(([key, value]) => value && query.set(key, String(value)));
            return `/videos${query.size ? `?${query}` : ""}`;
        };
        const chip = (active: boolean) => cn("rounded-full border px-3 py-1 text-sm", active ? "bg-primary text-primary-foreground" : "hover:bg-accent");
        const current = {category: categoryId, year: yearNumber, kind: kindValue, spex: spexId};

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                {spexId && (
                    <p className="flex flex-wrap items-baseline gap-x-3 text-sm">
                        <span>{t("spexFilter", {title: spexTitle ?? "?"})}</span>
                        <Link href={link({...current, spex: null})} className="text-primary hover:underline">{t("clearSpex")}</Link>
                    </p>
                )}
                <nav aria-label={t("categories")} className="flex flex-wrap gap-2">
                    <Link href={link({...current, category: null})} className={chip(!categoryId)}>{t("allCategories")}</Link>
                    {data?.categories.map(item => (
                        <Link key={item.id} href={link({...current, category: item.id})} className={chip(categoryId === item.id)}
                              aria-current={categoryId === item.id ? "page" : undefined}>{item.name}</Link>
                    ))}
                </nav>
                <nav aria-label={t("kinds")} className="flex flex-wrap gap-2">
                    <Link href={link({...current, kind: null})} className={chip(!kindValue)}>{t("allKinds")}</Link>
                    {data?.videoKinds.map(item => (
                        <Link key={item.id} href={link({...current, kind: item.id})} className={chip(kindValue === item.id)}
                              aria-current={kindValue === item.id ? "page" : undefined}>{kindName(item, locale)}</Link>
                    ))}
                </nav>
                <nav aria-label={t("years")} className="flex flex-wrap gap-1.5">
                    <Link href={link({...current, year: null})} className={chip(!yearNumber)}>{t("allYears")}</Link>
                    {data?.years.map(item => (
                        <Link key={item} href={link({...current, year: item})} className={cn(chip(yearNumber === item), "tabular-nums")}
                              aria-current={yearNumber === item ? "page" : undefined}>{item}</Link>
                    ))}
                </nav>
                {data && data.videos.length > 0 ? <VideoGrid videos={data.videos}/> : <p className="text-muted-foreground">{t("none")}</p>}
            </div>
        );
    });
}
