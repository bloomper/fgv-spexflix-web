import { describe, expect, it } from "vitest";
import { groupByDecade, groupByKind, resumeTarget, spexSections, watchedFraction } from "@/utils/rows";

const SHOW = { id: "k1", nameSv: "Föreställning", nameEn: "Show" };
const NUMBER = { id: "k2", nameSv: "Nummer", nameEn: "Number" };
const TRAILER = { id: "k3", nameSv: "Trailer", nameEn: "Trailer" };
const OTHER = { id: "k9", nameSv: "Okänd", nameEn: "Unknown" };

describe("rows", () => {
  it("says how much has been watched", () => {
    expect(watchedFraction({ id: "a", durationMs: 100_000, progressSeconds: 25 })).toBe(0.25);
    expect(watchedFraction({ id: "a", durationMs: 100_000, progressSeconds: 500 })).toBe(1);
    expect(watchedFraction({ id: "a", durationMs: null, progressSeconds: 25 })).toBe(0);
    expect(watchedFraction({ id: "a", finished: true })).toBe(1);
  });

  it("makes one row per kind with videos, in the kinds' order, and puts unknown kinds last", () => {
    const videos = [
      { id: "1", kind: NUMBER },
      { id: "2", kind: SHOW },
      { id: "3", kind: OTHER },
      { id: "4", kind: NUMBER },
    ];

    expect(
      groupByKind(videos, [SHOW, NUMBER, TRAILER]).map((group) => [
        group.kind.id,
        group.videos.map((video) => video.id),
      ])
    ).toEqual([
      ["k1", ["2"]],
      ["k2", ["1", "4"]],
      ["k9", ["3"]],
    ]);
  });

  it("makes one row per decade, newest first, leaving out videos without a year", () => {
    expect(
      groupByDecade([{ year: 1975 }, { year: 2003 }, { year: null }, { year: 1979 }]).map((group) => [
        group.decade,
        group.videos.length,
      ])
    ).toEqual([
      [2000, 1],
      [1970, 2],
    ]);
  });

  it("goes on with what was started, else the first not watched, skipping videos that are not ready", () => {
    expect(resumeTarget([{ id: "1", finished: true }, { id: "2", progressSeconds: 30 }, { id: "3" }])).toEqual({
      video: { id: "2", progressSeconds: 30 },
      resume: true,
    });
    expect(resumeTarget([{ id: "0", status: "PROCESSING" }, { id: "1", finished: true }, { id: "3" }])?.video.id).toBe(
      "3"
    );
    expect(resumeTarget([{ id: "1", finished: true }])).toEqual({ video: { id: "1", finished: true }, resume: false });
    expect(resumeTarget([{ id: "0", status: "FAILED" }])).toBeNull();
  });

  it("splits a spex's videos into the original's by kind and then each revival", () => {
    const original = { id: "s1", title: "Nobel", year: 1975, revival: false, familyId: "s1" };
    const revival = { id: "s2", title: "Nobel", year: 2026, revival: true, familyId: "s1" };
    const sections = spexSections(
      [
        { id: "1", kind: SHOW, spex: [original] },
        { id: "2", kind: NUMBER, spex: [original] },
        { id: "3", kind: SHOW, spex: [revival] },
      ],
      "s1",
      [SHOW, NUMBER]
    );

    expect(sections.map((section) => [section.key, section.videos.map((video) => video.id)])).toEqual([
      ["kind-k1", ["1"]],
      ["kind-k2", ["2"]],
      ["revival-s2", ["3"]],
    ]);
    expect(sections[2].revival).toEqual({ id: "s2", title: "Nobel", year: 2026 });
  });
});
