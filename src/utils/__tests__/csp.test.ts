import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "@/utils/csp";

describe("contentSecurityPolicy", () => {
  it("allows the media origin for video, images and fetches", () => {
    const policy = contentSecurityPolicy("https://media.example.org", false);

    expect(policy).toContain("media-src 'self' blob: https://media.example.org");
    expect(policy).toContain("connect-src 'self' https://media.example.org");
    expect(policy).not.toContain("unsafe-eval");
  });

  it("ignores an origin that is not one", () => {
    expect(contentSecurityPolicy("https://x.org; script-src *", false)).toContain("media-src 'self' blob:;");
  });
});
