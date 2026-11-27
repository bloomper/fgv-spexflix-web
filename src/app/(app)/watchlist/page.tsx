import { getTranslations } from "next-intl/server";
import { VideoGrid } from "@/components/video/video-grid";
import { getWatchList } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function WatchListPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("WatchList");
    const videos = await getWatchList();

    return (
      <Page variant="content">
        <PageHeader title={t("title")}/>
        {videos.length > 0 ? <VideoGrid videos={videos} /> : <DataEmpty title={t("none")} description={null} />}
      </Page>
    );
  });
}
