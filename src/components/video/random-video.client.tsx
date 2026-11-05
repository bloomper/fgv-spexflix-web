"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { randomVideoAction } from "@/components/video/actions.server";
import { track } from "@/utils/umami";

/**
 * Opens a video at random, like Spexify's random radio, and starts it.
 */
export function RandomVideoButton() {
  const t = useTranslations("Home");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button variant="outline" disabled={pending} onClick={() => startTransition(async () => {
      const id = await randomVideoAction();

      if (!id) {
        toast.error(t("randomNone"));
        return;
      }
      track("video-random");
      router.push(`/videos/${id}?autoplay=1`);
    })}>
      <Shuffle />{t("random")}
    </Button>
  );
}
