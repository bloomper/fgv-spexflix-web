"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setWatchedAction } from "@/components/video/actions.server";
import { track } from "@/utils/umami";

/**
 * Takes a video off "continue watching" by forgetting where the user was in it.
 */
export function ForgetProgressButton({ videoId, title }: { videoId: string; title: string }) {
  const t = useTranslations("Home");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button variant="secondary" size="icon-sm" className="rounded-full bg-black/70 text-white hover:bg-black/90"
            disabled={pending}
            aria-label={t("forget", { title })} title={t("forget", { title })}
            onClick={() => startTransition(async () => {
              if (await setWatchedAction(videoId, false)) {
                track("continue-forget");
                router.refresh();
              } else {
                toast.error(t("forgetFailed"));
              }
            })}>
      <X />
    </Button>
  );
}
