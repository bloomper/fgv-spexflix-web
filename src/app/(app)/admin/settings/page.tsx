import { getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/admin/admin.server";
import { getVideos } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { SettingsForm } from "./settings-form.client";

export default async function SettingsPage() {
  return withPolicyPage(Policies.admin.requireAdmin, async () => {
    const t = await getTranslations("AdminSettings");
    const [settings, catalogue] = await Promise.all([getSettings(), getVideos({ sort: "YEAR_DESC" })]);
    const videos = (catalogue?.videos ?? []).map(video => ({ id: video.id, title: video.title, year: video.year }));

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        {settings && <SettingsForm key={JSON.stringify(settings)} initial={settings} videos={videos} />}
      </div>
    );
  });
}
