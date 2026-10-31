export type Thumbnail = { start: number; end: number; url: string; x: number; y: number; width: number; height: number };

function seconds(stamp: string): number {
    const parts = stamp.trim().split(":").map(Number);

    return parts.reduce((total, part) => total * 60 + part, 0);
}

/**
 * Parses a WebVTT thumbnail index whose cues point into sprites ({@code sprite_001.jpg#xywh=0,0,160,90}), resolving the
 * sprites against the index's own address.
 */
export function parseThumbnails(vtt: string, indexUrl: string): Thumbnail[] {
    const thumbnails: Thumbnail[] = [];
    const lines = vtt.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
        const cue = /^([\d:.]+)\s+-->\s+([\d:.]+)/.exec(lines[i]);
        const target = lines[i + 1];

        if (!cue || !target) {
            continue;
        }

        const match = /^(.*)#xywh=(\d+),(\d+),(\d+),(\d+)$/.exec(target.trim());

        if (match) {
            thumbnails.push({
                start: seconds(cue[1]),
                end: seconds(cue[2]),
                url: new URL(match[1], indexUrl).toString(),
                x: Number(match[2]),
                y: Number(match[3]),
                width: Number(match[4]),
                height: Number(match[5]),
            });
        }
    }
    return thumbnails;
}

export function thumbnailAt(thumbnails: Thumbnail[], time: number): Thumbnail | undefined {
    return thumbnails.find(thumbnail => time >= thumbnail.start && time < thumbnail.end) ?? thumbnails.at(-1);
}
