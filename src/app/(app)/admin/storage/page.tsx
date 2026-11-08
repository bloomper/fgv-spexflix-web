import { getTranslations } from "next-intl/server";
import { getStorage } from "@/lib/admin/admin.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

function size(bytes: number) {
  return bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(1)} GB` : `${(bytes / 1024 ** 2).toFixed(0)} MB`;
}

export default async function StoragePage() {
  return withPolicyPage(Policies.admin.requireAdmin, async () => {
    const t = await getTranslations("AdminStorage");
    const storage = await getStorage();

    return (
      <div className="max-w-2xl flex flex-1 flex-col gap-6 p-4 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("text")}</p>
        {storage && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-lg border p-4 text-sm">
            <dt className="text-muted-foreground">{t("videos")}</dt>
            <dd className="tabular-nums">{storage.videoCount}</dd>
            <dt className="text-muted-foreground">{t("originals")}</dt>
            <dd className="tabular-nums">{size(storage.originalsBytes)}</dd>
            <dt className="text-muted-foreground">{t("renditions")}</dt>
            <dd className="tabular-nums">{size(storage.renditionsBytes)}</dd>
            <dt className="text-muted-foreground">{t("free")}</dt>
            <dd className="tabular-nums">{size(storage.freeBytes)}</dd>
          </dl>
        )}
      </div>
    );
  });
}
