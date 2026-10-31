"use client";

import {useState} from "react";
import {Film} from "lucide-react";
import {cn} from "@/utils/utils";

/**
 * A video's poster from {@code /api/poster/[id]}; a film icon when it has none.
 */
export function PosterImage({videoId, title, className}: { videoId: string; title: string; className?: string }) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div className={cn("flex aspect-video items-center justify-center bg-muted text-muted-foreground", className)}
                 role="img" aria-label={title}>
                <Film className="size-1/4"/>
            </div>
        );
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/poster/${videoId}`} alt={title} loading="lazy" onError={() => setFailed(true)}
             className={cn("aspect-video object-cover", className)}/>
    );
}
