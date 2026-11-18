import Link from "next/link";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resumeTarget } from "@/utils/rows";
import type { RowVideo } from "@/components/video/video-row";

/**
 * A title page's Play button: it goes on with the video the viewer has started, else plays the first one not watched
 * to the end.
 */
export function TitlePlay({ videos }: { videos: RowVideo[] }) {
  const t = useTranslations("Title");
  const target = resumeTarget(videos);

  if (!target) {
    return null;
  }
  return (
    <Button size="lg" nativeButton={false} render={<Link href={`/videos/${target.video.id}?autoplay=1`} />}>
      <Play className="fill-current" />
      {target.resume ? t("resume", { title: target.video.title })
        : target.video === videos[0] ? t("play") : t("playNext", { title: target.video.title })}
    </Button>
  );
}
