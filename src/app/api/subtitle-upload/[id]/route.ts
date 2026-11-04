import { NextRequest } from "next/server";
import { forwardForm } from "@/lib/http/forward-form.server";

/**
 * Uploads a subtitle file (WebVTT or SubRip) with its language and name.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return forwardForm(request, (await params).id, id => `/api/videos/${id}/subtitles`);
}
