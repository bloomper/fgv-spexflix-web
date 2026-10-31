import type {MetadataRoute} from "next";

/**
 * Makes Spexflix installable on phones and tablets, so it opens like an app.
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Spexflix",
        short_name: "Spexflix",
        description: "Spexens filmer",
        start_url: "/",
        display: "standalone",
        background_color: "#0f0c0a",
        theme_color: "#c8961e",
        icons: [{src: "/icon.svg", sizes: "any", type: "image/svg+xml"}],
    };
}
