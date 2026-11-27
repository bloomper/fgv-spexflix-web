/**
 * Every spex with videos, as one entry per original with its revivals: the original's title and year, a video for its
 * still, and how many videos it has. Newest first.
 */
export function spexFamilies<
  V extends {
    id: string;
    spex?: {
      id: string;
      title?: string | null;
      year?: number | null;
      revival?: boolean | null;
      familyId?: string;
      categoryName?: string | null;
    }[];
  },
>(
  videos: V[]
): { id: string; title: string; year: number | null; categoryName: string | null; videoId: string; count: number }[] {
  const families = new Map<
    string,
    {
      id: string;
      title: string;
      year: number | null;
      categoryName: string | null;
      videoId: string;
      count: number;
      original: boolean;
    }
  >();

  for (const video of videos) {
    const main = video.spex?.[0];

    if (!main?.familyId) {
      continue;
    }

    const original = main.id === main.familyId && !main.revival;
    const known = families.get(main.familyId);

    if (!known) {
      families.set(main.familyId, {
        id: main.familyId,
        title: main.title ?? "",
        year: main.year ?? null,
        categoryName: main.categoryName ?? null,
        videoId: video.id,
        count: 1,
        original,
      });
    } else {
      known.count++;
      // The original names the family, and its first video gives the still
      if (original && !known.original) {
        Object.assign(known, {
          title: main.title ?? known.title,
          year: main.year ?? known.year,
          videoId: video.id,
          original,
        });
      }
    }
  }
  return [...families.values()]
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title, "sv"))
    .map((family) => ({
      id: family.id,
      title: family.title,
      year: family.year,
      categoryName: family.categoryName,
      videoId: family.videoId,
      count: family.count,
    }));
}
