import { getLocale, getTranslations } from "next-intl/server";
import { RatingStars } from "@/components/rating.client";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { Hero } from "@/components/video/hero";
import { VideoRow } from "@/components/video/video-row";
import { ForgetProgressButton } from "@/components/video/forget-progress.client";
import { RandomVideoButton } from "@/components/video/random-video.client";
import { getHome, getMe } from "@/lib/video/video.server";
import { kindName } from "@/utils/format";
import { groupByDecade, groupByKind } from "@/utils/rows";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

/** The most cards a row of a kind, a decade or a collection shows; its link shows them all. */
const ROW = 30;

export default async function HomePage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Home");
    const locale = await getLocale();
    const [home, me] = await Promise.all([getHome(), getMe()]);
    const welcome = locale === "en" ? me?.settings.welcomeEn : me?.settings.welcomeSv;
    const name = me?.me.displayName ?? me?.me.username ?? "";

    if (!home || home.videos.length === 0) {
      return (
        <Page variant="content">
          <PageHeader
            title={t("greeting", { name })}
            description={welcome || t("intro")}
          />
          <DataEmpty
            title={t("empty")}
            description={null}
          />
        </Page>
      );
    }

    return (
      <div className="flex flex-1 flex-col pb-10">
        {home.featuredVideo && (
          <Hero video={home.featuredVideo}>
            <RandomVideoButton />
          </Hero>
        )}
        <section
          aria-label={t("welcome")}
          className="px-4 pt-2 pb-4 md:px-10"
        >
          <p className="text-muted-foreground max-w-4xl text-sm">
            <span className="text-foreground font-medium">{t("greeting", { name })}</span>{" "}
            <span className="text-pretty whitespace-pre-line">{welcome || t("intro")}</span>
          </p>
        </section>

        <div className="flex flex-col gap-6 md:gap-8">
          <VideoRow
            id="continue"
            title={t("continueWatching")}
            videos={home.continueWatching}
            action={(video) => (
              <ForgetProgressButton
                videoId={video.id}
                title={video.title}
              />
            )}
          />
          <VideoRow
            id="my-list"
            title={t("myList")}
            videos={home.watchList}
            more={{ href: "/watchlist", label: t("all") }}
          />
          <VideoRow
            id="recent"
            title={t("recent")}
            videos={home.recentVideos}
            more={{ href: "/videos?sort=PUBLISHED", label: t("allVideos") }}
          />
          <VideoRow
            id="top"
            title={t("topRated")}
            videos={home.topVideos}
            more={{ href: "/top", label: t("wholeTopList") }}
          />
          {groupByKind(home.videos, home.videoKinds).map((group) => (
            <VideoRow
              key={group.kind.id}
              id={`kind-${group.kind.id}`}
              title={kindName(group.kind, locale)}
              videos={group.videos.slice(0, ROW)}
              more={{ href: `/videos?kind=${group.kind.id}`, label: t("all") }}
            />
          ))}
          <VideoRow
            id="liked"
            title={t("liked")}
            videos={home.likedVideos.slice(0, ROW)}
            more={{ href: "/liked", label: t("allLiked") }}
          />
          {groupByDecade(home.videos).map((group) => (
            <VideoRow
              key={group.decade}
              id={`decade-${group.decade}`}
              title={t("decade", { decade: group.decade })}
              videos={group.videos.slice(0, ROW)}
              more={{ href: `/videos?decade=${group.decade}`, label: t("all") }}
            />
          ))}
          {home.collections.map((collection) => (
            <VideoRow
              key={collection.id}
              id={`collection-${collection.id}`}
              title={collection.title}
              videos={collection.videos.slice(0, ROW)}
              more={{ href: `/collections/${collection.id}`, label: t("collection") }}
            />
          ))}
          <VideoRow
            id="highest-rated"
            title={t("highestRated")}
            videos={home.highestRated.slice(0, ROW)}
            label={(video) => (
              <RatingStars value={home.highestRated.find((item) => item.id === video.id)?.myRating ?? 0} />
            )}
          />
        </div>
      </div>
    );
  });
}
