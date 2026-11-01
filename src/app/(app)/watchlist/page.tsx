import {getTranslations} from "next-intl/server";
import {VideoGrid} from "@/components/video/video-grid";
import {getWatchList} from "@/lib/video/video.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

export default async function WatchListPage() {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations("WatchList");
        const videos = await getWatchList();

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                {videos.length > 0 ? <VideoGrid videos={videos}/> : <p className="text-muted-foreground">{t("none")}</p>}
            </div>
        );
    });
}
