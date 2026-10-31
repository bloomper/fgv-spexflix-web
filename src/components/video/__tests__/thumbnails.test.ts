import {describe, expect, it} from "vitest";
import {parseThumbnails, thumbnailAt} from "@/components/video/thumbnails";
import {formatDuration, parsePosition} from "@/utils/duration";

describe("parseThumbnails", () => {
    it("reads cues and resolves sprites against the index", () => {
        const thumbnails = parseThumbnails(
            "WEBVTT\n\n00:00:00.000 --> 00:00:10.000\nsprite_001.jpg#xywh=0,0,160,90\n\n00:00:10.000 --> 00:00:20.000\nsprite_001.jpg#xywh=160,0,160,90\n",
            "https://media.example.org/v/1/sig/uuid/1/thumbs/thumbs.vtt");

        expect(thumbnails).toHaveLength(2);
        expect(thumbnails[1]).toEqual({
            start: 10, end: 20, url: "https://media.example.org/v/1/sig/uuid/1/thumbs/sprite_001.jpg", x: 160, y: 0, width: 160, height: 90,
        });
        expect(thumbnailAt(thumbnails, 12)?.x).toBe(160);
        expect(thumbnailAt(thumbnails, 99)?.x).toBe(160);
    });
});

describe("positions", () => {
    it("formats and parses", () => {
        expect(formatDuration(3725)).toBe("1:02:05");
        expect(parsePosition("75")).toBe(75);
        expect(parsePosition("1:15")).toBe(75);
        expect(parsePosition("1:02:05")).toBe(3725);
        expect(parsePosition("x")).toBeNull();
    });
});
