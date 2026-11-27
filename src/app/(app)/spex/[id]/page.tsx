import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { LayoutGrid } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Backdrop } from "@/components/video/backdrop";
import { EpisodeList } from "@/components/video/episode-list";
import { TitlePlay } from "@/components/video/title-actions";
import { getVideos } from "@/lib/video/video.server";
import { kindName } from "@/utils/format";
import { spexSections } from "@/utils/rows";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A spex's title page: a backdrop, Play, and its videos as episodes, the original's by kind and then each revival's.
 */
export default async function SpexPage({ params }: { params: Promise<{ id: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const { id } = await params;

    if (!ID.test(id)) {
      notFound();
    }

    const t = await getTranslations("Title");
    const tv = await getTranslations("Video");
    const locale = await getLocale();
    const data = await getVideos({ spexId: id, sort: "YEAR_ASC" });
    const videos = data?.videos ?? [];

    if (videos.length === 0) {
      notFound();
    }

    const spex =
      videos.flatMap((video) => video.spex).find((candidate) => candidate.id === id) ??
      videos.flatMap((video) => video.spex).find((candidate) => candidate.familyId === id);
    const sections = spexSections(videos, id, data?.videoKinds ?? []);
    const ordered = sections.flatMap((section) => section.videos);
    const title = spex?.title ?? videos[0].title;

    return (
      <div className="flex flex-1 flex-col pb-10">
        <Backdrop
          videoId={ordered[0]?.id}
          title={title}
        >
          <p className="text-link text-xs font-semibold tracking-widest uppercase">{t("spex")}</p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">{title}</h1>
          <p className="text-muted-foreground text-sm">
            {[spex?.year, spex?.categoryName, t("videos", { count: videos.length })].filter(Boolean).join(" · ")}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <TitlePlay videos={ordered} />
            <Button
              size="lg"
              variant="secondary"
              nativeButton={false}
              render={<Link href={`/videos?spex=${id}`} />}
            >
              <LayoutGrid />
              {t("asGrid")}
            </Button>
          </div>
        </Backdrop>
        <div className="max-w-5xl space-y-8 px-4 md:px-10">
          {sections.map((section) => {
            const heading = section.revival
              ? `${tv("revival")} ${section.revival.year ?? ""}`.trim()
              : section.kind
                ? kindName(section.kind, locale)
                : "";

            return (
              <section
                key={section.key}
                aria-labelledby={section.key}
                className="space-y-2"
              >
                <h2
                  id={section.key}
                  className="text-xl font-semibold"
                >
                  {heading}
                </h2>
                <EpisodeList
                  videos={section.videos}
                  label={heading}
                />
              </section>
            );
          })}
        </div>
      </div>
    );
  });
}
