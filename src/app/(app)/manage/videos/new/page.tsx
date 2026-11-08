import { getTranslations } from "next-intl/server";
import { getVideoKinds } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { NewVideo } from "./new-video.client";

export default async function NewVideoPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Manage");
    const kinds = await getVideoKinds();

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("newVideo")}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t("newVideoText")}</p>
        <NewVideo kinds={kinds} />
      </div>
    );
  });
}
