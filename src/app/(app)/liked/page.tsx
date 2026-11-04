import { getTranslations } from "next-intl/server";
import { VideoGrid } from "@/components/video/video-grid";
import { getLiked } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

export default async function LikedPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Liked");
    const videos = await getLiked();

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="max-w-3xl text-pretty text-sm text-muted-foreground">{t("text")}</p>
        </div>
        {videos.length > 0 ? <VideoGrid videos={videos} /> : <p className="text-muted-foreground">{t("none")}</p>}
      </div>
    );
  });
}
