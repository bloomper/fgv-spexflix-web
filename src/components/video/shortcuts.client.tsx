"use client";

import * as React from "react";
import {type RefObject, useEffect, useRef} from "react";
import {useTranslations} from "next-intl";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";

const SHORTCUTS: { keys: string[]; action: string }[] = [
    {keys: ["Space", "K"], action: "toggle"},
    {keys: ["J", "L"], action: "seek10"},
    {keys: ["←", "→"], action: "seek5"},
    {keys: ["P", "N"], action: "chapter"},
    {keys: ["F"], action: "fullscreen"},
    {keys: ["M"], action: "mute"},
    {keys: ["C"], action: "subtitles"},
    {keys: ["?"], action: "help"},
];

/**
 * Whether the focused element uses the key itself: every key while typing, the space key on a button or link, and
 * arrows and the space key on the video's own controls, sliders, menus and lists.
 */
export function ownsKeys(target: EventTarget | null, key: string): boolean {
    if (!(target instanceof Element)) {
        return false;
    }
    if (target.closest("input:not([type=range]):not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable=''], [contenteditable='true']")) {
        return true;
    }
    if (key === " " && target.closest("button, a, summary, [role='button'], [role='checkbox'], [role='switch'], [role='radio']")) {
        return true;
    }
    return (key === " " || key.startsWith("Arrow"))
        && target.closest("video, input[type=range], [role='slider'], [role='menu'], [role='menuitem'], [role='listbox'], [role='option'], [role='radiogroup']") !== null;
}

/**
 * The player's keyboard shortcuts, anywhere on the page except where the focused element uses the key itself.
 */
export function useVideoShortcuts(video: RefObject<HTMLVideoElement | null>, chapters: { startSeconds: number }[], showHelp: () => void,
                                  toggleFullscreen?: () => void) {
    const latest = useRef({chapters, showHelp, toggleFullscreen});

    useEffect(() => {
        latest.current = {chapters, showHelp, toggleFullscreen};
    }, [chapters, showHelp, toggleFullscreen]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const element = video.current;

            if (!element || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || ownsKeys(event.target, event.key)) {
                return;
            }

            const seek = (seconds: number) => {
                element.currentTime = Math.min(Math.max(0, element.currentTime + seconds), Number.isFinite(element.duration) ? element.duration : Infinity);
            };
            const starts = latest.current.chapters.map(chapter => chapter.startSeconds).sort((a, b) => a - b);
            let handled = true;

            switch (event.key.toLowerCase()) {
                case " ":
                case "k":
                    if (element.paused) {
                        void element.play().catch(() => undefined);
                    } else {
                        element.pause();
                    }
                    break;
                case "j":
                    seek(-10);
                    break;
                case "l":
                    seek(10);
                    break;
                case "arrowleft":
                    seek(-5);
                    break;
                case "arrowright":
                    seek(5);
                    break;
                case "n": {
                    const next = starts.find(start => start > element.currentTime + 1);

                    if (next !== undefined) {
                        element.currentTime = next;
                    }
                    break;
                }
                case "p": {
                    // Back to the start of this chapter, or to the one before when just past its start
                    const previous = starts.filter(start => start < element.currentTime - 3).at(-1);

                    element.currentTime = previous ?? 0;
                    break;
                }
                case "f":
                    if (latest.current.toggleFullscreen) {
                        latest.current.toggleFullscreen();
                    } else if (document.fullscreenElement) {
                        void document.exitFullscreen().catch(() => undefined);
                    } else {
                        void element.requestFullscreen?.().catch(() => undefined);
                    }
                    break;
                case "m":
                    element.muted = !element.muted;
                    break;
                case "c": {
                    const tracks = Array.from(element.textTracks);
                    const showing = tracks.find(track => track.mode === "showing");

                    tracks.forEach(track => {
                        track.mode = "disabled";
                    });
                    if (!showing && tracks[0]) {
                        tracks[0].mode = "showing";
                    }
                    break;
                }
                case "?":
                    latest.current.showHelp();
                    break;
                default:
                    handled = false;
            }
            if (handled) {
                event.preventDefault();
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [video]);
}

export function VideoShortcutsDialog({open, onOpenChange}: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const t = useTranslations("Shortcuts");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("title")}</DialogTitle>
                    <DialogDescription>{t("description")}</DialogDescription>
                </DialogHeader>
                <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
                    {SHORTCUTS.map(shortcut => (
                        <React.Fragment key={shortcut.action}>
                            <dt className="flex flex-wrap gap-1">
                                {shortcut.keys.map(key => (
                                    <kbd key={key} className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">{key}</kbd>
                                ))}
                            </dt>
                            <dd>{t(shortcut.action)}</dd>
                        </React.Fragment>
                    ))}
                </dl>
            </DialogContent>
        </Dialog>
    );
}
