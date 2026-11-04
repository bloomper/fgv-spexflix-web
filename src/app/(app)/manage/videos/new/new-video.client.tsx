"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { type KindOption, VideoForm } from "@/components/video/video-form.client";
import { createVideoAction } from "@/app/(app)/manage/actions.server";
import { track } from "@/utils/umami";

/**
 * The form for a new video. Cache Components keep the page mounted after leaving it, so the form starts over once a
 * video was created; otherwise the next new video would begin with the previous one's spex.
 */
export function NewVideo({ kinds }: { kinds: KindOption[] }) {
  const t = useTranslations("Manage");
  const router = useRouter();
  const [generation, setGeneration] = useState(0);

  return (
    <VideoForm key={generation} kinds={kinds} submitLabel={t("create")} onSubmit={async input => {
      const result = await createVideoAction(input);

      if (result.ok && result.data) {
        track("video-create", { defaultKind: !input.kindId || input.kindId === kinds[0]?.id });
        router.push(`/manage/videos/${result.data}`);
        setGeneration(current => current + 1);
        return true;
      }
      toast.error(result.ok ? t("failed") : result.message);
      return false;
    }} />
  );
}
