import { describe, expect, it } from "vitest";
import { spexFamilies } from "@/utils/spex-families";

describe("spexFamilies", () => {
  it("lists each original once with its revivals' videos, named by the original, newest first", () => {
    const nobel = { id: "s1", title: "Nobel", year: 1975, revival: false, familyId: "s1", categoryName: "Chalmersspexet" };
    const nobelRevival = { id: "s2", title: "Nobel!", year: 2026, revival: true, familyId: "s1", categoryName: "Chalmersspexet" };
    const caesar = { id: "s3", title: "Caesar", year: 1990, revival: false, familyId: "s3" };

    expect(spexFamilies([
      { id: "v1", spex: [nobelRevival] },
      { id: "v2", spex: [nobel] },
      { id: "v3", spex: [caesar] },
      { id: "v4", spex: [] },
    ])).toEqual([
      { id: "s3", title: "Caesar", year: 1990, categoryName: null, videoId: "v3", count: 1 },
      { id: "s1", title: "Nobel", year: 1975, categoryName: "Chalmersspexet", videoId: "v2", count: 2 },
    ]);
  });
});
