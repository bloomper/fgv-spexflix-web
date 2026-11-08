import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { HomeSection } from "@/components/home-section";
import { RatingStars } from "@/components/rating.client";
import { VideoGrid } from "@/components/video/video-grid";
import { ForgetProgressButton } from "@/components/video/forget-progress.client";
import { RandomVideoButton } from "@/components/video/random-video.client";
import { getHome, getMe } from "@/lib/video/video.server";
import { decadesOf } from "@/utils/decades";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@/components/data-empty";

const SHELF = 6;

export default async function HomePage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Home");
    const locale = await getLocale();
    const [home, me] = await Promise.all([getHome(), getMe()]);
    const welcome = locale === "en" ? me?.settings.welcomeEn : me?.settings.welcomeSv;
    const chip = "rounded-full border px-3 py-1 text-sm hover:bg-accent";

    return (
      <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
        <section className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("greeting", { name: me?.me.displayName ?? me?.me.username ?? "" })}
            </h1>
            <RandomVideoButton />
          </div>
          <p className="max-w-4xl whitespace-pre-line text-pretty text-muted-foreground">{welcome || t("intro")}</p>
        </section>

        {home && (home.categories.length > 0 || home.years.length > 0) && (
          <nav aria-label={t("browse")} className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {home.categories.map(category => (
                <Link key={category.id} href={`/videos?category=${category.id}`} className={chip}>
                  {category.name} <span className="ml-1 text-muted-foreground">{category.videoCount}</span>
                </Link>
              ))}
              <Link href="/top" className={chip}>{t("topList")}</Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {decadesOf(home.years).map(decade => (
                <Link key={decade} href={`/videos?decade=${decade}`}
                      className="rounded-md border px-2.5 py-1 text-sm tabular-nums hover:bg-accent">
                  {t("decade", { decade })}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {home && home.continueWatching.length > 0 && (
          <HomeSection id="continue" title={t("continueWatching")}>
            <VideoGrid videos={home.continueWatching}
                       action={video => <ForgetProgressButton videoId={video.id} title={video.title} />} />
          </HomeSection>
        )}

        {home && home.topVideos.length > 0 && (
          <HomeSection id="top" title={t("topRated")} more={{ href: "/top", label: t("wholeTopList") }}>
            <VideoGrid videos={home.topVideos} />
          </HomeSection>
        )}

        <HomeSection id="recent" title={t("recent")} more={{ href: "/videos?sort=PUBLISHED", label: t("allVideos") }}>
          {home && home.recentVideos.length > 0
            ? <VideoGrid videos={home.recentVideos} />
            : <DataEmpty title={t("empty")} description={null} />}
        </HomeSection>

        {home && home.likedVideos.length > 0 && (
          <HomeSection id="liked" title={t("liked")} more={{ href: "/liked", label: t("allLiked") }}>
            <VideoGrid videos={home.likedVideos.slice(0, SHELF)} />
          </HomeSection>
        )}

        {home && home.highestRated.length > 0 && (
          <HomeSection id="highest-rated" title={t("highestRated")}>
            <VideoGrid videos={home.highestRated.slice(0, SHELF)} label={video =>
              <RatingStars value={home.highestRated.find(item => item.id === video.id)?.myRating ?? 0} />} />
          </HomeSection>
        )}
      </div>
    );
  });
}
