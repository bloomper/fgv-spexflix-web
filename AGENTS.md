<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Spexflix Web — project notes

Next.js 16 App Router + React 19 frontend for Spexflix, FGV's video service. It is backed by `fgv-spexflix-server`'s
GraphQL API and its plain HTTP endpoints for posters, subtitle and poster uploads and tus uploads; video itself comes
from the media server (nginx, `spexflix-media`) through signed addresses. Stack and setup: `README.md`. Product spec:
`fgv-spexflix-spec`. The scaffolding comes from `fgv-spexify-web` (and through it `fgv-revival-web`); keep them alike.

## Commands

- `npm run dev` (port 3003) / `build` / `start`
- `npm run lint`, `npm run typecheck` (covers `src/**` only)
- `npm run test` (Vitest), `npm run test:e2e` (Playwright, `e2e/mock-backend.mjs` stands in for the server and Keycloak)
- `npm run gql-codegen` — regenerate `src/gql/` from a sibling `fgv-spexflix-server` checkout. Commit the result.

**Don't run `npm run format`**: `.prettierrc` uses 2 spaces and the code base 4.

## Conventions

- `"use client"` ⇔ `*.client.ts(x)`; `import "server-only"` and `"use server"` ⇔ `*.server.ts`. Exceptions:
  `src/auth.ts`, Next.js reserved file names, and shadcn's `src/components/ui/**` and `src/hooks/use-mobile.ts`.
- Cache Components is on. `(app)/layout.tsx` keeps `export const instant = false`. The root layout's metadata stays
  static.
- Locale is a cookie (`sv` default); messages in `messages/{sv,en}.json`. The theme is dark by default.
- Auth: Better Auth + Keycloak, stateless. `getSessionContext()` in `src/utils/auth.server.ts` is the single entry
  point; roles come from `resource_access["fgv-spexflix"].roles`: `USER` (access), `EDITOR`, `ADMIN`. Gate pages with
  `withPolicyPage(Policies.<area>.require…)`. The server enforces every rule anyway.
- No `NEXT_PUBLIC_*` variables: read config on the server at request time and pass it as props.
- **The Content Security Policy is set in `src/proxy.ts`**, not `next.config.ts`, because it names the media hostname
  (`MEDIA_ORIGIN`), which differs per environment while `next.config.ts` headers are fixed at build time.

## How Spexflix works in the web

- **Playing**: `VideoPlayer` (`src/components/video/video-player.client.tsx`) gets the signed master playlist from
  `playback(videoId)` and plays it natively in Safari, through hls.js elsewhere. The browser's controls do play, volume,
  subtitles (`<track>`, `crossOrigin="anonymous"`), speed, full screen and picture-in-picture; a timeline below shows
  chapters and the thumbnail sprites from the WebVTT index (`parseThumbnails`). Progress is saved every 15 seconds and
  on pause (`saveProgressAction`), and a page opened with `?t=` (seconds or m:ss) starts there.
- **Posters** come from `/api/poster/[id]` (uploaded, a frame, or the spex poster; 404 and `PosterImage`'s
  placeholder). Never `next/image`.
- **Uploads** use tus through `/api/uploads/[[...path]]`; `videoSetFile` queues the upload for the worker. The editor
  page refreshes every 3 seconds while a job is queued or running. Posters and subtitles (WebVTT or SubRip) are
  multipart forms through `/api/poster-upload/[id]` and `/api/subtitle-upload/[id]`.
- **Chapters** are edited as rows (start in m:ss, title, optional Spexify track from `spexifyTracks`) and saved
  together with `chaptersSet`. Viewers with Spexify access (`me.spexifyUser`) get *Listen in Spexify* links.
- **Editors** work under `/manage` (videos, the processing queue, the trash, the change log), **admins** under
  `/admin` (storage, settings). Only `READY` videos can be published.

## Testing

- Unit tests in `__tests__/` beside the code. E2E specs in `e2e/`, one per area, with personas `admin`, `editor`,
  `viewer` and `noaccess` in the mock backend. All test data is fictitious.
- Use `{exact: true}` for names that are part of others ("I min lista" in "Lägg till i min lista", "Namn" in
  "Användarnamn").
