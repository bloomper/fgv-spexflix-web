import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {GET as poster} from "@/app/api/poster/[id]/route";
import {POST as posterUpload} from "@/app/api/poster-upload/[id]/route";
import {POST as subtitleUpload} from "@/app/api/subtitle-upload/[id]/route";

const apiFetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api.server", () => ({apiFetch}));

const params = (id: string) => ({params: Promise.resolve({id})});

describe("GET /api/poster/[id]", () => {
    const get = () => new NextRequest("http://spexflix.test/api/poster/01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e");

    beforeEach(() => {
        apiFetch.mockReset();
        apiFetch.mockResolvedValue(new Response("x", {status: 200, headers: {"content-type": "image/jpeg"}}));
    });

    it("streams the poster from the server, sandboxed", async () => {
        const response = await poster(get(), params("01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e"));

        expect(apiFetch).toHaveBeenCalledWith("/api/videos/01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e/poster", expect.anything());
        expect(response.status).toBe(200);
        expect(response.headers.get("content-security-policy")).toContain("sandbox");
    });

    it("refuses an id that is not a number", async () => {
        expect((await poster(get(), params("../01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e"))).status).toBe(400);
        expect(apiFetch).not.toHaveBeenCalled();
    });
});

describe.each([
    ["a poster", posterUpload, "/api/videos/01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e/poster", "poster.png", "image/png"],
    ["subtitles", subtitleUpload, "/api/videos/01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e/subtitles", "sv.vtt", "text/vtt"],
])("uploading %s", (_, route, path, name, type) => {
    const upload = (headers: Record<string, string> = {}) => {
        const form = new FormData();

        form.append("file", new Blob(["data"], {type}), name);
        return new NextRequest("http://spexflix.test/api/upload/01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e", {method: "POST", body: form, headers: {host: "spexflix.test", ...headers}});
    };

    beforeEach(() => {
        apiFetch.mockReset();
    });

    it("forwards the form to the server", async () => {
        apiFetch.mockResolvedValue(new Response("{}", {status: 200}));

        const response = await route(upload({origin: "http://spexflix.test"}), params("01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e"));

        expect(apiFetch).toHaveBeenCalledWith(path, expect.objectContaining({method: "POST"}));
        expect(await response.json()).toEqual({ok: true});
    });

    it("passes the server's refusal on with its code and message, also without a body", async () => {
        apiFetch.mockResolvedValueOnce(new Response(JSON.stringify({code: "BAD_REQUEST", message: "Fel format"}), {status: 400}));

        const response = await route(upload(), params("01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e"));

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({code: "BAD_REQUEST", message: "Fel format"});

        apiFetch.mockResolvedValueOnce(new Response("", {status: 502}));
        const empty = await route(upload(), params("01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e"));

        expect(empty.status).toBe(502);
        expect(await empty.json()).toEqual({code: null, message: null});
    });

    it("refuses another site and a bad id", async () => {
        expect((await route(upload({origin: "https://evil.test"}), params("01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e"))).status).toBe(403);
        expect((await route(upload(), params("x"))).status).toBe(400);
        expect(apiFetch).not.toHaveBeenCalled();
    });
});
