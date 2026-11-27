import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPlayback, getVideo, getVideoKinds } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { isAdmin } from "@/utils/auth";
import { TrashVideo, VideoEditor } from "./video-editor.client";
import { CreditsEditor } from "@/components/video/credits-editor.client";
import { RecordHistory } from "@/components/audit/change-log";
import { auditLink } from "../../audit/links";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  return withPolicyPage(Policies.editor.requireEditor, async (authz) => {
    const { id } = await params;

    if (!ID.test(id)) {
      notFound();
    }

    const t = await getTranslations("Manage");
    const [video, kinds] = await Promise.all([getVideo(id), getVideoKinds()]);

    if (!video || video.trashedAt) {
      notFound();
    }

    const playback = video.status === "READY" ? await getPlayback(id) : null;

    return (
      <Page variant="content">
        <PageHeader title={video.title} actions={<Link href={`/videos/${video.id}`} className="text-sm text-link hover:text-link/80">{t("viewAsViewer")}</Link>}/>
        <VideoEditor video={video}
                     playback={playback} admin={isAdmin(authz.roles)} kinds={kinds}
                     spexipediaUrl={process.env.SPEXIPEDIA_WEB_URL?.trim().replace(/\/+$/, "") || null} />
        {/* Keyed by the saved credits: the page stays mounted, and the rows start over from what was saved */}
        <div className="pt-4">
          <CreditsEditor key={JSON.stringify(video.credits)} videoId={video.id} credits={video.credits} />
        </div>
        <TrashVideo video={video} />
        <RecordHistory entityId={video.id} path="/manage/audit" linkOf={auditLink} />
      </Page>
    );
  });
}
