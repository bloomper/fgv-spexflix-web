"use client";

import * as React from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Camera, ImageUp, Plus, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { type KindOption, VideoForm, type VideoFormValues } from "@/components/video/video-form.client";
import { type PlayerHandle, VideoPlayer } from "@/components/video/video-player.client";
import { PosterImage } from "@/components/video/poster-image.client";
import { uploadFile } from "@/components/upload/tus.client";
import { formatDuration, parsePosition } from "@/utils/duration";
import type { ChapterInput } from "@/gql/graphql";
import {
  posterFrameAction,
  publishVideoAction,
  removeSubtitleAction,
  reprocessAction,
  setChaptersAction,
  setFileAction,
  spexifyTracksAction,
  trashVideoAction,
  updateVideoAction,
} from "@/app/(app)/manage/actions.server";
import { track } from "@/utils/umami";
import { useDialogs } from "@/components/dialogs.client";

export type EditorVideo = VideoFormValues & {
  id: string;
  status: string;
  failure?: string | null;
  published: boolean;
  durationMs?: number | null;
  originalName?: string | null;
  originalSize?: number | null;
  originalKept: boolean;
  renditions: { height: number; width: number; bitrateKbps: number; copied: boolean; size: number }[];
  chapters: {
    startSeconds: number;
    title: string;
    spexifyTrackId?: string | null;
    spexifyTrackTitle?: string | null
  }[];
  subtitles: { language: string; label: string }[];
  job?: { status: string; progress: number; error?: string | null } | null;
};

type Playback = {
  masterUrl: string;
  thumbnailsUrl?: string | null;
  subtitles: { language: string; label: string; url: string }[]
};
type Track = { id: string; title: string; discNumber: number; trackNumber: number; albumTitle: string };
type ChapterRow = { time: string; title: string; trackId: string };

const ACCEPT = "video/*,.mp4,.mov,.mkv,.webm,.avi,.mpg,.mpeg,.mts,.m2ts,.ts,.dv,.wmv";

function useRun() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return {
    pending,
    router,
    run: (work: () => Promise<{ ok: boolean; message?: string }>, success?: string) => startTransition(async () => {
      const result = await work();

      if (result.ok) {
        if (success) {
          toast.success(success);
        }
        router.refresh();
      } else {
        toast.error(result.message ?? "Error");
      }
    }),
  };
}

function megabytes(bytes: number) {
  return bytes >= 1024 * 1024 * 1024 ? `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Editing a video: its file (uploaded resumably and processed by the worker), fields, publishing, poster, chapters
 * linked to Spexify's tracks, and subtitles.
 */
export function VideoEditor({ video, playback, admin, kinds }: {
  video: EditorVideo;
  playback: Playback | null;
  admin: boolean;
  kinds: KindOption[];
}) {
  const t = useTranslations("Manage");
  const tv = useTranslations("Video");
  const { pending, run, router } = useRun();
  const player = useRef<PlayerHandle>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<{ name: string; progress: number } | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [chapters, setChapters] = useState<ChapterRow[]>(() => video.chapters.map(chapter => ({
    time: formatDuration(chapter.startSeconds), title: chapter.title, trackId: chapter.spexifyTrackId ?? "",
  })));
  const [subtitle, setSubtitle] = useState({ language: "sv", label: "Svenska" });
  const busy = video.job?.status === "QUEUED" || video.job?.status === "RUNNING";

  useEffect(() => {
    if (!busy && video.status !== "PROCESSING") {
      return;
    }

    const timer = setInterval(() => router.refresh(), 3000);

    return () => clearInterval(timer);
  }, [busy, video.status, router]);

  const spexKey = (video.spex ?? []).map(spex => spex.id).join(",");

  useEffect(() => {
    if (!spexKey) {
      return;
    }
    void spexifyTracksAction(video.id).then(result => result.ok && setTracks(result.data));
  }, [video.id, spexKey]);

  const sendFile = async (file: File) => {
    setUpload({ name: file.name, progress: 0 });
    try {
      const uploadId = await uploadFile(file, progress => setUpload({ name: file.name, progress }));
      const result = await setFileAction(video.id, uploadId);

      if (result.ok) {
        track("video-upload", { replaced: video.status !== "UPLOADING" });
        toast.success(t("fileQueued"));
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setUpload(null);
    }
  };

  const postForm = (path: string, form: FormData) => run(async () => {
    const response = await fetch(path, { method: "POST", body: form });
    const body = await response.json().catch(() => ({})) as { message?: string };

    return response.ok ? { ok: true } : { ok: false, message: body.message ?? t("failed") };
  }, t("saved"));

  const saveChapters = () => {
    const inputs: ChapterInput[] = [];

    for (const row of chapters) {
      const start = parsePosition(row.time.trim());

      if (start === null || !row.title.trim()) {
        toast.error(t("chapterInvalid"));
        return;
      }

      const track = tracks.find(candidate => candidate.id === row.trackId);

      inputs.push({
        startSeconds: start,
        title: row.title.trim(),
        spexifyTrackId: track?.id ?? null,
        spexifyTrackTitle: track?.title ?? null,
      });
    }
    run(() => setChaptersAction(video.id, inputs), t("saved"));
  };

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("file")}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={video.status === "FAILED" ? "destructive" : "secondary"}>{tv(`status.${video.status}`)}</Badge>
          {video.originalName && (
            <span className="text-sm text-muted-foreground">
                            {video.originalName}{video.originalSize ? ` · ${megabytes(video.originalSize)}` : ""}
              {video.durationMs ? ` · ${formatDuration(video.durationMs / 1000)}` : ""}
              {!video.originalKept && ` · ${t("originalNotKept")}`}
                        </span>
          )}
        </div>
        {busy && (
          <div className="space-y-1" aria-live="polite">
            <p
              className="text-sm">{video.job?.status === "QUEUED" ? t("queued") : t("processing", { progress: video.job?.progress ?? 0 })}</p>
            <progress max={100} value={video.job?.progress ?? 0} className="w-full max-w-md"
                      aria-label={t("processingLabel")} />
          </div>
        )}
        {video.failure && <p className="text-sm text-destructive">{t("failure", { message: video.failure })}</p>}
        {video.renditions.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {t("renditions")}: {video.renditions.map(r => `${r.height}p${r.copied ? ` (${t("copied")})` : ""} ${megabytes(r.size)}`).join(", ")}
          </p>
        )}
        {upload && (
          <div className="space-y-1" aria-live="polite">
            <p className="text-sm">{t("uploading", { name: upload.name })}</p>
            <progress max={1} value={upload.progress} className="w-full max-w-md" aria-label={upload.name} />
          </div>
        )}
        <input ref={fileInput} type="file" accept={ACCEPT} className="hidden" onChange={event => {
          const file = event.target.files?.[0];

          event.target.value = "";
          if (file) {
            void sendFile(file);
          }
        }} />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={pending || busy || upload !== null}
                  onClick={() => fileInput.current?.click()}>
            <Upload />{video.originalName ? t("replaceFile") : t("uploadFile")}
          </Button>
          {admin && video.originalKept && video.originalName && (
            <Button variant="ghost" disabled={pending || busy}
                    onClick={() => run(() => reprocessAction(video.id), t("fileQueued"))}>
              <RefreshCw />{t("reprocess")}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t("fileText")}</p>
      </section>

      <label className="flex items-center gap-3 rounded-lg border p-3">
        <Switch checked={video.published} disabled={pending || video.status !== "READY"}
                onCheckedChange={checked => {
                  track("video-publish", { published: checked });
                  run(() => publishVideoAction(video.id, checked));
                }} />
        <span>
                    <span className="block font-medium">{video.published ? t("published") : t("unpublished")}</span>
                    <span
                      className="block text-xs text-muted-foreground">{video.status === "READY" ? t("publishText") : t("publishWhenReady")}</span>
                </span>
      </label>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("details")}</h2>
        <VideoForm kinds={kinds} submitLabel={t("save")} initial={video} onSubmit={async input => {
          const result = await updateVideoAction(video.id, input);

          if (result.ok) {
            toast.success(t("saved"));
            router.refresh();
          } else {
            toast.error(result.message);
          }
          return result.ok;
        }} />
      </section>

      {playback && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("preview")}</h2>
          <div className="max-w-3xl">
            <VideoPlayer ref={player} videoId={video.id} masterUrl={playback.masterUrl}
                         thumbnailsUrl={playback.thumbnailsUrl}
                         subtitles={playback.subtitles} chapters={video.chapters}
                         durationSeconds={(video.durationMs ?? 0) / 1000}
                         recordProgress={false} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PosterImage key={video.status} videoId={video.id} title={video.title} className="w-40 rounded" />
            <Button variant="outline" disabled={pending}
                    onClick={() => run(() => posterFrameAction(video.id, player.current?.currentTime() ?? 0), t("saved"))}>
              <Camera />{t("posterFromFrame")}
            </Button>
            <input ref={posterInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                   onChange={event => {
                     const file = event.target.files?.[0];

                     event.target.value = "";
                     if (file) {
                       const form = new FormData();

                       form.append("file", file);
                       postForm(`/api/poster-upload/${video.id}`, form);
                     }
                   }} />
            <Button variant="ghost" disabled={pending}
                    onClick={() => posterInput.current?.click()}><ImageUp />{t("posterUpload")}</Button>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("chapters")}</h2>
        <p className="text-sm text-muted-foreground">{tracks.length > 0 ? t("chaptersText") : t("chaptersNoTracks")}</p>
        <ol className="space-y-2">
          {chapters.map((row, index) => (
            <li key={index} className="flex flex-wrap items-end gap-2">
              <div className="w-24 space-y-1">
                <Label htmlFor={`time-${index}`} className="text-xs">{t("start")}</Label>
                <Input id={`time-${index}`} value={row.time} className="tabular-nums"
                       onChange={event => setChapters(chapters.map((r, i) => i === index ? {
                         ...r,
                         time: event.target.value,
                       } : r))} />
              </div>
              <div className="min-w-48 flex-1 space-y-1">
                <Label htmlFor={`chapter-${index}`} className="text-xs">{t("chapterTitle")}</Label>
                <Input id={`chapter-${index}`} value={row.title} maxLength={255}
                       onChange={event => setChapters(chapters.map((r, i) => i === index ? {
                         ...r,
                         title: event.target.value,
                       } : r))} />
              </div>
              {tracks.length > 0 && (
                <div className="min-w-48 space-y-1">
                  <Label htmlFor={`track-${index}`} className="text-xs">{t("spexifyTrack")}</Label>
                  <NativeSelect id={`track-${index}`} value={row.trackId} onChange={event => {
                    const track = tracks.find(candidate => candidate.id === event.target.value);

                    setChapters(chapters.map((r, i) => i === index
                      ? { ...r, trackId: event.target.value, title: r.title || track?.title || "" } : r));
                  }}>
                    <NativeSelectOption value="">{t("noTrack")}</NativeSelectOption>
                    {tracks.map(track => (
                      <NativeSelectOption key={track.id}
                                          value={track.id}>{track.trackNumber}. {track.title} ({track.albumTitle})</NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
              )}
              <Button variant="ghost" size="icon" aria-label={t("removeChapter", { title: row.title })}
                      onClick={() => setChapters(chapters.filter((_, i) => i !== index))}><X /></Button>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setChapters([...chapters, {
            time: formatDuration(player.current?.currentTime() ?? 0), title: "", trackId: "",
          }])}><Plus />{playback ? t("addChapterHere") : t("addChapter")}</Button>
          <Button disabled={pending} onClick={saveChapters}>{t("saveChapters")}</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("subtitles")}</h2>
        {video.subtitles.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {video.subtitles.map(item => (
              <li key={item.language} className="flex items-center gap-3 px-3 py-2">
                <span className="flex-1">{item.label} <span
                  className="text-muted-foreground">({item.language})</span></span>
                <Button variant="ghost" size="sm" disabled={pending}
                        onClick={() => run(() => removeSubtitleAction(video.id, item.language))}>{t("remove")}</Button>
              </li>
            ))}
          </ul>
        )}
        <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
          event.preventDefault();

          const form = new FormData(event.currentTarget);

          form.set("language", subtitle.language);
          form.set("label", subtitle.label);
          postForm(`/api/subtitle-upload/${video.id}`, form);
          event.currentTarget.reset();
        }}>
          <div className="w-24 space-y-1">
            <Label htmlFor="sub-language" className="text-xs">{t("language")}</Label>
            <Input id="sub-language" value={subtitle.language} pattern="[a-z]{2,3}(-[A-Za-z]{2,4})?" required
                   onChange={event => setSubtitle({ ...subtitle, language: event.target.value })} />
          </div>
          <div className="w-40 space-y-1">
            <Label htmlFor="sub-label" className="text-xs">{t("label")}</Label>
            <Input id="sub-label" value={subtitle.label} maxLength={50} required
                   onChange={event => setSubtitle({ ...subtitle, label: event.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sub-file" className="text-xs">{t("subtitleFile")}</Label>
            <Input id="sub-file" name="file" type="file" accept=".vtt,.srt,text/vtt" required />
          </div>
          <Button type="submit" variant="outline" disabled={pending}>{t("uploadSubtitles")}</Button>
        </form>
      </section>
    </div>
  );
}

/** Moving a video to the trash; shown last on the edit page, above the change log. */
export function TrashVideo({ video }: { video: Pick<EditorVideo, "id" | "title"> }) {
  const t = useTranslations("Manage");
  const { confirm } = useDialogs();
  const { pending, run, router } = useRun();

  return (
    <section className="space-y-2 rounded-lg border border-destructive/40 p-4">
      <h2 className="font-semibold">{t("trashVideo")}</h2>
      <p className="text-sm text-muted-foreground">{t("trashVideoText")}</p>
      <Button variant="destructive" disabled={pending} onClick={async () => {
        if (await confirm({
          title: t("confirmTrash", { title: video.title }),
          confirmLabel: t("toTrash"),
          destructive: true,
        })) {
          run(async () => {
            const result = await trashVideoAction(video.id, true);

            if (result.ok) {
              router.push("/manage/videos");
            }
            return result;
          }, t("trashed"));
        }
      }}><Trash2 />{t("toTrash")}</Button>
    </section>
  );
}
