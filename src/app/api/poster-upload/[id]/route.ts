import {NextRequest} from "next/server";
import {forwardForm} from "@/lib/http/forward-form.server";

/**
 * Uploads a video's poster image. The server checks the role, the size and that it is an image.
 */
export async function POST(request: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    return forwardForm(request, (await params).id, id => `/api/videos/${id}/poster`);
}
