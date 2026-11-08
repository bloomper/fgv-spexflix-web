import { getTranslations } from "next-intl/server";
import { VideoGrid } from "@/components/video/video-grid";
import { getWatchList } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@/components/data-empty";

export default async function WatchListPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("WatchList");
    const videos = await getWatchList();

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        {videos.length > 0 ? <VideoGrid videos={videos} /> : <DataEmpty title={t("none")} description={null} />}
      </div>
    );
  });
}
