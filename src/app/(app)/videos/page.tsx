import {Suspense} from "react";
import Link from "next/link";
import {getLocale, getTranslations} from "next-intl/server";
import {EyeOff, Heart} from "lucide-react";
import {VideoGrid} from "@/components/video/video-grid";
import {SortSelect} from "@/components/sort-select.client";
import {getVideos} from "@/lib/video/video.server";
import type {VideoSort} from "@/gql/graphql";
import {decadesOf, parseDecade} from "@/utils/decades";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {cn} from "@/utils/utils";
import {kindName} from "@/utils/format";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SORTS: VideoSort[] = ["YEAR_DESC", "YEAR_ASC", "TITLE", "PUBLISHED", "RATING", "LIKES"];

type Params = { category?: string; year?: string; decade?: string; kind?: string; spex?: string; sort?: string; liked?: string; unwatched?: string };

export default async function VideosPage({searchParams}: { searchParams: Promise<Params> }) {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations("Videos");
        const locale = await getLocale();
        const {category, year, decade, kind, spex, sort, liked, unwatched} = await searchParams;
        const categoryId = category && ID.test(category) ? category : null;
        const yearNumber = year && /^\d{4}$/.test(year) ? Number(year) : null;
        const decadeNumber = yearNumber ? Math.floor(yearNumber / 10) * 10 : parseDecade(decade);
        const kindValue = kind && ID.test(kind) ? kind : null;
        const spexId = spex && ID.test(spex) ? spex : null;
        const sortBy = SORTS.find(candidate => candidate === sort) ?? "YEAR_DESC";
        const onlyLiked = liked === "1";
        const onlyUnwatched = unwatched === "1";
        const data = await getVideos({
            categoryId, year: yearNumber, kindId: kindValue, spexId, sort: sortBy, liked: onlyLiked || null, unwatched: onlyUnwatched || null,
            fromYear: !yearNumber && decadeNumber ? decadeNumber : null, toYear: !yearNumber && decadeNumber ? decadeNumber + 9 : null,
        });
        // The spex as the videos have it: the original when the filter is one, else the revival itself.
        const linked = data?.videos.flatMap(video => video.spex);
        const spexTitle = spexId ? (linked?.find(item => item.id === spexId)?.title ?? linked?.find(item => item.familyId === spexId)?.title) : null;
        const current = {
            category: categoryId, year: yearNumber, decade: yearNumber ? null : decadeNumber, kind: kindValue, spex: spexId,
            liked: onlyLiked ? "1" : null, unwatched: onlyUnwatched ? "1" : null, sort: sortBy === "YEAR_DESC" ? null : sortBy,
        };
        const link = (changes: Partial<Record<keyof typeof current, string | number | null>>) => {
            const query = new URLSearchParams();

            Object.entries({...current, ...changes}).forEach(([key, value]) => value && query.set(key, String(value)));
            return `/videos${query.size ? `?${query}` : ""}`;
        };
        const chip = (active: boolean) => cn("rounded-full border px-3 py-1 text-sm", active ? "bg-primary text-primary-foreground" : "hover:bg-accent");
        const years = data?.years ?? [];

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href={link({liked: onlyLiked ? null : "1"})} className={cn(chip(onlyLiked), "inline-flex items-center gap-1.5")}
                              aria-pressed={onlyLiked}>
                            <Heart className={cn("size-4", onlyLiked && "fill-current")}/>{t("onlyLiked")}
                        </Link>
                        <Link href={link({unwatched: onlyUnwatched ? null : "1"})} className={cn(chip(onlyUnwatched), "inline-flex items-center gap-1.5")}
                              aria-pressed={onlyUnwatched}>
                            <EyeOff className="size-4"/>{t("onlyUnwatched")}
                        </Link>
                        <Suspense>
                            <SortSelect label={t("sortLabel")} value={sortBy} options={SORTS.map(value => ({value, label: t(`sort.${value}`)}))}/>
                        </Suspense>
                    </div>
                </div>
                {spexId && (
                    <p className="flex flex-wrap items-baseline gap-x-3 text-sm">
                        <span>{t("spexFilter", {title: spexTitle ?? "?"})}</span>
                        <Link href={link({spex: null})} className="text-primary hover:underline">{t("clearSpex")}</Link>
                    </p>
                )}
                <nav aria-label={t("categories")} className="flex flex-wrap gap-2">
                    <Link href={link({category: null})} className={chip(!categoryId)}>{t("allCategories")}</Link>
                    {data?.categories.map(item => (
                        <Link key={item.id} href={link({category: item.id})} className={chip(categoryId === item.id)}
                              aria-current={categoryId === item.id ? "page" : undefined}>{item.name}</Link>
                    ))}
                </nav>
                <nav aria-label={t("kinds")} className="flex flex-wrap gap-2">
                    <Link href={link({kind: null})} className={chip(!kindValue)}>{t("allKinds")}</Link>
                    {data?.videoKinds.map(item => (
                        <Link key={item.id} href={link({kind: item.id})} className={chip(kindValue === item.id)}
                              aria-current={kindValue === item.id ? "page" : undefined}>{kindName(item, locale)}</Link>
                    ))}
                </nav>
                <nav aria-label={t("years")} className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                        <Link href={link({year: null, decade: null})} className={chip(!decadeNumber)}>{t("allYears")}</Link>
                        {decadesOf(years).map(item => (
                            <Link key={item} href={link({year: null, decade: item})} className={cn(chip(decadeNumber === item && !yearNumber), "tabular-nums")}
                                  aria-current={decadeNumber === item && !yearNumber ? "page" : undefined}>{t("decade", {decade: item})}</Link>
                        ))}
                    </div>
                    {decadeNumber && (
                        <div className="flex flex-wrap gap-1.5">
                            {years.filter(item => item >= decadeNumber && item < decadeNumber + 10).map(item => (
                                <Link key={item} href={link({year: item, decade: null})} className={cn(chip(yearNumber === item), "tabular-nums")}
                                      aria-current={yearNumber === item ? "page" : undefined}>{item}</Link>
                            ))}
                        </div>
                    )}
                </nav>
                {data && data.videos.length > 0 ? <VideoGrid videos={data.videos}/> : <p className="text-muted-foreground">{t("none")}</p>}
            </div>
        );
    });
}
