import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { creditHref } from "@/lib/credits";
import { getCredits } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * Everyone who takes part in the videos, by name, with how many videos each, like Spexify's credits pages.
 */
export default async function CreditsPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Credits");
    const credits = await getCredits();

    return (
      <Page variant="content">
        <PageHeader
          title={t("title")}
          description={t("text")}
        />
        {credits.length === 0 ? (
          <DataEmpty
            title={t("none")}
            description={null}
          />
        ) : (
          <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {credits.map((credit) => (
              <li key={credit.name}>
                <Link
                  href={creditHref(credit.name)}
                  className="hover:bg-accent flex items-baseline justify-between gap-3 rounded px-2 py-1.5"
                >
                  <span className="min-w-0 truncate">{credit.name}</span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {t("videos", { count: credit.videoCount })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Page>
    );
  });
}
