import { getTranslations } from "next-intl/server";
import { getVideoKinds } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { NewVideo } from "./new-video.client";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function NewVideoPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Manage");
    const kinds = await getVideoKinds();

    return (
      <Page variant="content">
        <PageHeader
          title={t("newVideo")}
          description={t("newVideoText")}
        />
        <NewVideo kinds={kinds} />
      </Page>
    );
  });
}
