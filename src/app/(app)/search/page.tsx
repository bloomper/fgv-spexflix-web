import Form from "next/form";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Search } from "lucide-react";
import { SubmitButton } from "@/components/submit-button.client";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { VideoGrid } from "@/components/video/video-grid";
import { search } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Search");
    const q = ((await searchParams).q ?? "").slice(0, 200);
    const ready = q.trim().length >= 2;
    const tooShort = q.trim().length === 1;
    const videos = ready ? await search(q) : null;

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{ready ? t("resultsFor", { q }) : t("title")}</h1>
        <Form action="/search" role="search" className="flex max-w-xl gap-2">
          <Input key={q} name="q" type="search" defaultValue={q} maxLength={200} placeholder={t("placeholder")}
                 aria-label={t("query")} aria-invalid={tooShort || undefined}
                 aria-describedby={tooShort ? "search-q-error" : undefined} />
          <SubmitButton>{t("title")}</SubmitButton>
        </Form>
        {tooShort && <p id="search-q-error" className="-mt-4 text-sm text-destructive">{t("tooShort")}</p>}
        {!q.trim() && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Search /></EmptyMedia>
              <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
              <EmptyDescription>{t("hint")}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/videos" className="text-sm text-primary hover:text-primary/80">{t("browse")}</Link>
            </EmptyContent>
          </Empty>
        )}
        {videos?.length === 0 && <p className="text-muted-foreground">{t("none")}</p>}
        {videos && videos.length > 0 && <VideoGrid videos={videos} />}
      </div>
    );
  });
}
