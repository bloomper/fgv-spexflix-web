import { NextRequest } from "next/server";
import { ID, invalid, streamFromApi } from "@/lib/http/proxy.server";

/**
 * A video's poster (uploaded, or a frame), or its spex poster; 404 when it has none, so the card shows its placeholder.
 * Sandboxed, since an image opened on its own could otherwise run script.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return ID.test(id)
    ? streamFromApi(request, `/api/videos/${id}/poster`, { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" })
    : invalid();
}
