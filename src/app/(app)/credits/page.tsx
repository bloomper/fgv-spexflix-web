import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { creditHref } from "@/lib/credits";
import { getCredits } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

/**
 * Everyone who takes part in the videos, by name, with how many videos each, like Spexify's credits pages.
 */
export default async function CreditsPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Credits");
    const credits = await getCredits();

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t("text")}</p>
        {credits.length === 0 ? <p className="text-muted-foreground">{t("none")}</p> : (
          <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {credits.map(credit => (
              <li key={credit.name}>
                <Link href={creditHref(credit.name)}
                      className="flex items-baseline justify-between gap-3 rounded px-2 py-1.5 hover:bg-accent">
                  <span className="min-w-0 truncate">{credit.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {t("videos", { count: credit.videoCount })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  });
}
