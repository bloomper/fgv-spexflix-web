# Spexflix Web

## Overview

Spexflix Web is the frontend of Spexflix, FGV's video service for the recordings of the spex: full shows, numbers,
trailers and material from behind the scenes. Viewers browse, search and watch, with chapters, subtitles, timeline
thumbnails, *Continue watching* and a watch list. Editors upload videos and keep their metadata, chapters (linked to
Spexify's tracks), subtitles and posters; admins see storage and settings. It talks to [Spexflix Server][1] over
GraphQL, and plays video from the media server (`spexflix-media`) through signed, expiring addresses. The product spec
is in [fgv-spexflix-spec][2].

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Cache Components)
- **Video:** [hls.js](https://github.com/video-dev/hls.js), or Safari's own HLS
- **UI & Styling:** [shadcn/ui](https://ui.shadcn.com/), [Base UI](https://base-ui.com/) &
  [Tailwind CSS 4](https://tailwindcss.com/); dark by default
- **Data Fetching:** [urql](https://formidable.com/open-source/urql/) (GraphQL) with GraphQL Code Generator
- **Uploads:** [tus-js-client](https://github.com/tus/tus-js-client), resumable, in chunks of at most 50 MB
- **Authentication:** [Better Auth](https://better-auth.com/) (Keycloak, stateless sessions)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/) (Swedish and English)

## Getting Started

Node.js 26 (see `.nvmrc`), a running Spexflix Server with its media server, Keycloak from `fgv-infra-deploy/local`,
and the `fgv-spexflix` client in the realm.

```bash
npm install
cp .env.local.example .env.local   # set KEYCLOAK_CLIENT_SECRET and AUTH_SECRET
npm run dev                        # http://localhost:3003
```

| Variable                         | Purpose                                                                   |
|----------------------------------|---------------------------------------------------------------------------|
| `BETTER_AUTH_URL`                | The web's public address                                                  |
| `AUTH_SECRET`                    | Encrypts the session cookies; at least 32 random characters               |
| `KEYCLOAK_ISSUER`                | The realm, e.g. `https://auth.example.org/auth/realms/fgv`                |
| `KEYCLOAK_CLIENT_ID`, `_SECRET`  | The `fgv-spexflix` client                                                 |
| `API_GRAPHQL_ENDPOINT`           | Spexflix Server's GraphQL endpoint; its other endpoints share the origin  |
| `MEDIA_ORIGIN`                   | The media hostname, e.g. `https://media.spexflix.example.org`, allowed by the pages' Content Security Policy |
| `SPEXIFY_WEB_URL`                | Spexify, for *Listen in Spexify* on chapters; without it there are none   |
| `SPEXREGISTER_WEB_URL`           | Spexregister, for links to a spex                                         |
| `SUPPORTED_LOCALES`, `DEFAULT_LOCALE` | `sv,en` and `sv`                                                    |
| `SUPPORT_EMAIL`, `FEEDBACK_EMAIL` | Addresses on the Support and About pages                                 |
| `UMAMI_URL`, `UMAMI_WEBSITE_ID`  | Visitor statistics; without them nothing is sent                          |

## Commands

| Command                 | What it does                                                                       |
|-------------------------|------------------------------------------------------------------------------------|
| `npm run dev`           | Development server on port 3003                                                    |
| `npm run build` / `start` | Production build and server                                                      |
| `npm run lint`, `typecheck` | ESLint and TypeScript                                                          |
| `npm run test`          | Unit tests (Vitest)                                                                |
| `npm run test:e2e`      | E2E tests (Playwright) against `e2e/mock-backend.mjs`, which also acts as Keycloak |
| `npm run gql-codegen`   | Regenerates `src/gql/` from a sibling `fgv-spexflix-server` checkout; commit the result |

## Branding

Spexflix's mark is `src/components/brand/spexflix-mark.tsx` and `src/app/icon.svg`; its colours are the `--brand`
tokens at the top of `src/app/globals.css`, which also drive `--primary`.

## Docker

The `Dockerfile` builds a standalone image, published by CI as `bloomper/fgv-spexflix-web`. `fgv-spexflix-deploy` runs
it.

[1]: https://github.com/bloomper/fgv-spexflix-server
[2]: https://github.com/bloomper/fgv-spexflix-spec
