import * as React from "react";

/**
 * Spexflix's mark: a play button on a stage curtain. Replace this file to change the logo; the colours come from the
 * theme's {@code --brand} tokens in globals.css.
 */
export function SpexflixMark(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" {...props}
             className={`block h-full w-full ${props.className ?? ""}`}>
            <rect x="2" y="2" width="60" height="60" rx="14" fill="var(--brand)"/>
            <path d="M8 8 Q16 30 8 56 L18 56 Q24 30 18 8 Z M56 8 Q48 30 56 56 L46 56 Q40 30 46 8 Z" fill="var(--brand-accent)" opacity="0.55"/>
            <path d="M26 21 L44 32 L26 43 Z" fill="var(--brand-foreground)"/>
        </svg>
    );
}

export function SpexflixWordmark({className}: { className?: string }) {
    return (
        <span className={`font-semibold tracking-tight ${className ?? ""}`}>
            Spex<span className="text-(--brand)">flix</span>
        </span>
    );
}
