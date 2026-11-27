import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Info, Play } from "lucide-react";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Backdrop } from "@/components/video/backdrop";
import { infoHrefOf, type RowVideo } from "@/components/video/video-row";
import { formatDuration } from "@/utils/duration";
import { kindName } from "@/utils/format";

/**
 * The top of the start page: the featured video over the whole width, with a short description, Play (which goes on
 * where the viewer left off) and More info.
 */
export function Hero({ video, children }: { video: RowVideo & { description?: string | null }; children?: ReactNode }) {
  const t = useTranslations("Hero");
  const locale = useLocale();
  const duration = (video.durationMs ?? 0) / 1000;
  const resume = !video.finished && (video.progressSeconds ?? 0) > 0;

  return (
    <Backdrop
      videoId={video.id}
      title={video.title}
    >
      <p className="text-link text-xs font-semibold tracking-widest uppercase">{t("featured")}</p>
      <h1 className="text-3xl font-bold tracking-tight text-balance drop-shadow sm:text-5xl">{video.title}</h1>
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="secondary">{kindName(video.kind, locale)}</Badge>
        {[video.year, video.spex?.[0]?.categoryName, duration > 0 ? formatDuration(duration) : null]
          .filter(Boolean)
          .join(" · ")}
      </div>
      {video.description && <p className="line-clamp-3 max-w-2xl text-pretty sm:text-lg">{video.description}</p>}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={`/videos/${video.id}?autoplay=1`} />}
        >
          <Play className="fill-current" />
          {resume ? t("resume") : t("play")}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          nativeButton={false}
          render={<Link href={infoHrefOf(video)} />}
        >
          <Info />
          {t("moreInfo")}
        </Button>
        {children}
      </div>
    </Backdrop>
  );
}
