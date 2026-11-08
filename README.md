# Spexflix Web

## Overview

Spexflix Web is the frontend of Spexflix, FGV's video service for the recordings of the spex: full shows, numbers,
trailers and material from behind the scenes. Viewers browse, search and watch, with chapters, subtitles, timeline
thumbnails, *Continue watching* and a watch list. Editors upload videos and keep their metadata, chapters (linked to
Spexify's tracks), subtitles and posters; admins see storage and settings. It talks to [Spexflix Server][1] over
GraphQL, and plays video from the media server (`spexflix-media`) through signed, expiring addresses. The product spec
is in [fgv-spexflix-spec][2].

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI & Styling:** [shadcn/ui](https://ui.shadcn.com/), [Base UI](https://base-ui.com/) &
  [Tailwind CSS 4](https://tailwindcss.com/)
- **Data Fetching:** [urql](https://formidable.com/open-source/urql/) (GraphQL) with GraphQL Code Generator
- **Authentication:** [Better Auth](https://better-auth.com/) (Keycloak integration, stateless sessions)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/) (Supports Swedish & English)
- **Video:** [hls.js](https://github.com/video-dev/hls.js), or Safari's own HLS
- **Uploads:** [tus-js-client](https://github.com/tus/tus-js-client), resumable, in chunks of at most 50 MB

The look (logo, favicon and colours) is FGV's, shared with Spexregister and Nyuppsättning.

## Getting Started

### Prerequisites

- Node.js 26 (see `.nvmrc`)
- npm (package manager)
- Docker & Docker Compose (optional, for containerized setup)

### Development

1. **Install dependencies:**
   ```bash
   npm ci
   ```

2. **Configure environment:**
   Start fgv-infra-deploy's local stack and [Spexflix Server][1]'s (its getting started guide describes both), then
   create `.env.local` (`.env` already holds the rest):
   ```
   BETTER_AUTH_URL=http://localhost:3003
   AUTH_SECRET=<random string of at least 32 characters>
   KEYCLOAK_CLIENT_ID=fgv-spexflix
   KEYCLOAK_CLIENT_SECRET=<secret of the fgv-spexflix client>
   KEYCLOAK_ISSUER=https://auth.fgv.local.nu:8443/auth/realms/fgv
   API_GRAPHQL_ENDPOINT=https://api.spexflix.fgv.local.nu:8443/api/graphql
   MEDIA_ORIGIN=https://media.spexflix.fgv.local.nu:8443
   SPEXIFY_WEB_URL=http://localhost:3002
   SPEXREGISTER_WEB_URL=http://localhost:3000
   FGV_REVIVAL_WEB_URL=http://localhost:3001
   SPEXGRAM_WEB_URL=http://localhost:3004
   ARCHIVE_WEB_URL=http://localhost:3005
   ```
   The client secret is in `realm/fgv.json` in [fgv-keycloak][7]; search for `fgv-spexflix`.
   For visitor statistics, run fgv-infra-deploy's `local/bin/configure-umami.sh` and put the ID it prints for Spexflix
   in `.env.local` as `UMAMI_WEBSITE_ID`, with `UMAMI_URL=https://analytics.fgv.local.nu:8443`.
   `npm run dev` and `docker compose` trust the root certificate of fgv-infra-deploy's local Caddy
   (`local/.docker/caddy/data/caddy/pki/authorities/local/root.crt`), read from `../fgv-infra-deploy`, or from
   `INFRA_DEPLOY` if it is checked out elsewhere.

   | Variable                         | Purpose                                                                   |
   |----------------------------------|---------------------------------------------------------------------------|
   | `API_GRAPHQL_ENDPOINT`           | Spexflix Server's GraphQL endpoint; its other endpoints share the origin     |
   | `MEDIA_ORIGIN`                   | The media server's origin, allowed by the pages' Content Security Policy; `http://localhost:8084` when Spexflix Server runs with `bootRun` |
   | `SPEXIFY_WEB_URL`                | Spexify, for *Listen in Spexify* on chapters; without it there are none; also the application switcher |
   | `SPEXREGISTER_WEB_URL`           | Spexregister, for links to a spex; also the application switcher          |
   | `FGV_REVIVAL_WEB_URL`            | Nyuppsättning, for the application switcher in the header                 |
   | `SPEXGRAM_WEB_URL`               | Spexgram, for the application switcher                                    |
   | `ARCHIVE_WEB_URL`                | Spexarkiv, for the application switcher                                 |

3. **Generate GraphQL types:**
   If you change GraphQL queries or the schema, regenerate types from a sibling `fgv-spexflix-server` checkout:
   ```bash
   npm run gql-codegen
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3003](http://localhost:3003) with your browser to see the result. Port 3003 keeps it
   clear of the other FGV webs (Spexregister on 3000, Nyuppsättning on 3001, Spexify on 3002, Spexflix on 3003).

## Docker

The project includes a `Dockerfile` and `docker-compose.yaml` for containerized deployment, including a Caddy reverse
proxy setup for local development with HTTPS.

### Running with Docker Compose

To start the application along with the Caddy reverse proxy:

```bash
docker compose up --build
```

The application will be accessible at `https://spexflix.fgv.local.nu:9443` if your hosts file is configured. It talks to
the server's API at `api.spexflix.fgv.local.nu:8443` and to Keycloak at `auth.fgv.local.nu:8443`, both behind
fgv-infra-deploy's local Caddy. To log in, `SPEXFLIX_URL` in fgv-infra-deploy's `local/.env` must be
`https://spexflix.fgv.local.nu:9443`, since the realm only accepts redirects to that address.

### Published images

CI publishes `bloomper/fgv-spexflix-web` for `linux/amd64`:

| Trigger              | Tags                              |
|----------------------|-----------------------------------|
| push to `develop`    | `develop`, `sha-<commit>`         |
| push of tag `vX.Y.Z` | `X.Y.Z`, `latest`, `sha-<commit>` |

To release, set `version` in `package.json` to `X.Y.Z`, merge to `main`, then
`git tag vX.Y.Z && git push origin vX.Y.Z`. The publish fails if the tag doesn't match the version or if `X.Y.Z` is
already on Docker Hub.

The image contains no environment-specific values. All configuration is read at runtime: `BETTER_AUTH_URL`,
`AUTH_SECRET`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `KEYCLOAK_ISSUER`, `API_GRAPHQL_ENDPOINT`,
`MEDIA_ORIGIN`, `SPEXIFY_WEB_URL`, `SPEXREGISTER_WEB_URL`, `SUPPORT_EMAIL`, `FEEDBACK_EMAIL`, `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `FGV_REVIVAL_WEB_URL`, `SPEXGRAM_WEB_URL`, `ARCHIVE_WEB_URL`, `UMAMI_URL` and
`UMAMI_WEBSITE_ID`. Visitor statistics go to Umami only when both Umami variables are set.
[fgv-spexflix-deploy][8] runs it.

## Building and Deployment

### Tests

`npm run test` runs the unit tests and `npm run test:e2e` the Playwright tests, against `e2e/mock-backend.mjs`, which
also acts as Keycloak. See the [contributor guidelines][5] for the checks CI runs.

### Production Build

To create an optimized production build manually:

```bash
npm run build
npm run start
```

## Contributing

Contributors to this project agree to uphold its [code of conduct][3].

You can contribute to Spexflix Web by:

- Opening a [pull request][4]. Please see the [contributor guidelines][5] for details

## License

Spexflix Web is open source software released under the [Apache 2.0 license][6].

[1]: https://github.com/bloomper/fgv-spexflix-server

[2]: https://github.com/bloomper/fgv-spexflix-spec

[3]: CODE_OF_CONDUCT.md

[4]: https://help.github.com/articles/using-pull-requests/

[5]: CONTRIBUTING.md

[6]: https://www.apache.org/licenses/LICENSE-2.0.html

[7]: https://github.com/bloomper/fgv-keycloak

[8]: https://github.com/bloomper/fgv-spexflix-deploy
