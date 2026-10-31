export function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const whole = Math.floor(seconds);
    const hours = Math.floor(whole / 3600);
    const minutes = Math.floor((whole % 3600) / 60);
    const secs = String(whole % 60).padStart(2, "0");

    return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${secs}` : `${minutes}:${secs}`;
}

/**
 * Reads a position given as seconds ("75") or as h:mm:ss / m:ss ("1:15").
 */
export function parsePosition(value: string | null | undefined): number | null {
    if (!value) {
        return null;
    }
    if (/^\d+$/.test(value)) {
        return Number(value);
    }

    const parts = value.split(":");

    if (parts.length < 2 || parts.length > 3 || parts.some(part => !/^\d+$/.test(part))) {
        return null;
    }
    return parts.reduce((total, part) => total * 60 + Number(part), 0);
}
