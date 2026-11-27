/**
 * Grouping videos into the rows of the start page and the sections of a title page. Kinds are data: they come from
 * the API's video kinds, in their order.
 */

type Kinded = { kind: { id?: string; nameSv: string; nameEn: string } };
type Timed = {
  id: string;
  durationMs?: number | null;
  progressSeconds?: number | null;
  finished?: boolean;
  status?: string;
};

/**
 * How much of a video the user has watched, from 0 to 1.
 */
export function watchedFraction(video: Timed): number {
  const duration = (video.durationMs ?? 0) / 1000;

  if (video.finished) {
    return 1;
  }
  return duration > 0 && video.progressSeconds ? Math.min(1, video.progressSeconds / duration) : 0;
}

/**
 * One group per kind that has videos, in the kinds' order; videos of a kind not in the list come last, in a group of
 * their own kind.
 */
export function groupByKind<K extends { id: string }, V extends Kinded>(
  videos: V[],
  kinds: K[]
): { kind: K | V["kind"]; videos: V[] }[] {
  const groups = kinds.map((kind) => ({
    kind: kind as K | V["kind"],
    videos: videos.filter((video) => video.kind.id === kind.id),
  }));
  const known = new Set(kinds.map((kind) => kind.id));
  const others = new Map<string, { kind: V["kind"]; videos: V[] }>();

  for (const video of videos) {
    const id = video.kind.id ?? "";

    if (!known.has(id)) {
      const group = others.get(id) ?? { kind: video.kind, videos: [] as V[] };

      group.videos.push(video);
      others.set(id, group);
    }
  }
  return [...groups, ...others.values()].filter((group) => group.videos.length > 0);
}

/**
 * One group per decade with videos, newest first; videos without a year are left out.
 */
export function groupByDecade<V extends { year?: number | null }>(videos: V[]): { decade: number; videos: V[] }[] {
  const decades = new Map<number, V[]>();

  for (const video of videos) {
    if (video.year) {
      const decade = Math.floor(video.year / 10) * 10;

      decades.set(decade, [...(decades.get(decade) ?? []), video]);
    }
  }
  return [...decades.entries()].sort(([a], [b]) => b - a).map(([decade, list]) => ({ decade, videos: list }));
}

/**
 * Where a title's Play button goes on: the first video the user has started and not finished, else the first not
 * watched to the end, else the first. Videos that are not ready are skipped. Null without a playable video.
 */
export function resumeTarget<V extends Timed>(videos: V[]): { video: V; resume: boolean } | null {
  const playable = videos.filter((video) => !video.status || video.status === "READY");
  const started = playable.find((video) => !video.finished && (video.progressSeconds ?? 0) > 0);

  if (started) {
    return { video: started, resume: true };
  }

  const next = playable.find((video) => !video.finished) ?? playable[0];

  return next ? { video: next, resume: false } : null;
}

type SpexOf = {
  spex?: { id: string; title?: string | null; year?: number | null; revival?: boolean | null; familyId?: string }[];
};

/**
 * A spex's title page in sections: the original's videos by kind, then each revival's videos, oldest revival first.
 */
export function spexSections<K extends { id: string }, V extends Kinded & SpexOf>(
  videos: V[],
  familyId: string,
  kinds: K[]
): {
  key: string;
  kind?: K | V["kind"];
  revival?: { id: string; title?: string | null; year?: number | null };
  videos: V[];
}[] {
  const ofRevival = (video: V) =>
    video.spex?.find((spex) => spex.familyId === familyId && spex.revival && spex.id !== familyId);
  const originals = videos.filter((video) => !ofRevival(video));
  const revivals = new Map<string, { id: string; title?: string | null; year?: number | null; videos: V[] }>();

  for (const video of videos) {
    const revival = ofRevival(video);

    if (revival) {
      const entry = revivals.get(revival.id) ?? {
        id: revival.id,
        title: revival.title,
        year: revival.year,
        videos: [],
      };

      entry.videos.push(video);
      revivals.set(revival.id, entry);
    }
  }
  return [
    ...groupByKind(originals, kinds).map((group) => ({
      key: `kind-${group.kind.id ?? ""}`,
      kind: group.kind,
      videos: group.videos,
    })),
    ...[...revivals.values()]
      .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
      .map(({ videos: list, ...revival }) => ({ key: `revival-${revival.id}`, revival, videos: list })),
  ];
}
