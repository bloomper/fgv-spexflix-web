// A stand-in for Spexflix Server and Keycloak in E2E tests: GraphQL for videos and watching, the poster and media
// endpoints the web calls, and a mini-Keycloak (discovery, authorize, token, JWKS, userinfo, logout).
// All data is fictitious.

import {createServer} from "node:http";
import {randomUUID} from "node:crypto";
import {exportJWK, generateKeyPair, SignJWT} from "jose";

const PORT = Number(process.env.MOCK_PORT || 4101);
const ISSUER = `http://localhost:${PORT}/realms/fgv`;
const CLIENT_ID = "fgv-spexflix";
const KID = "e2e-key";
const TOKEN_TTL = 3600;

const PERSONAS = {
    admin: {sub: "p-admin", name: "Sara Admin", email: "sara.admin@example.org", roles: ["USER", "ADMIN"]},
    editor: {sub: "p-editor", name: "Erik Redaktör", email: "erik@example.org", roles: ["USER", "EDITOR"]},
    viewer: {sub: "p-viewer", name: "Tina Tittare", email: "tina@example.org", roles: ["USER"]},
    noaccess: {sub: "p-noaccess", name: "Nils Nekad", email: "nils@example.org", roles: []},
};
const bySub = Object.fromEntries(Object.values(PERSONAS).map(persona => [persona.sub, persona]));
let currentPersona = "admin";

class GraphQLError extends Error {
    constructor(classification, message) {
        super(message);
        this.classification = classification;
    }
}

const SPEX = {id: "1", title: "Nobel", year: 1975, revival: false, categoryId: "1", categoryName: "Chalmersspexet"};

function video(id, title, extra = {}) {
    return {
        id, uuid: randomUUID(), title, year: 1975, kind: "FULL_SHOW", performance: "Premiären", performanceDate: "1975-02-14",
        description: "Inspelat 1975.", spex: SPEX, status: "READY", failure: null, durationMs: 60000, width: 1280, height: 720,
        published: true, publishedAt: "2026-10-01T10:00:00Z", trashedAt: null, originalName: "nobel.mp4", originalSize: 1000000,
        originalKept: true, hasThumbnails: false, posterSeconds: null,
        renditions: [{height: 720, width: 1280, bitrateKbps: 3000, copied: true, size: 1000}],
        chapters: [{startSeconds: 0, title: "Ouvertyr", spexifyTrackId: null, spexifyTrackTitle: null},
            {startSeconds: 20, title: "Kärleksduetten", spexifyTrackId: "12", spexifyTrackTitle: "Kärleksduetten"}],
        subtitles: [], createdAt: "2026-10-01T10:00:00Z", lastModifiedAt: null, job: null, ...extra,
    };
}

let state;

function resetState() {
    state = {
        nextId: 100,
        videos: [
            video("1", "Nobel"),
            video("2", "Opublicerad film", {published: false, kind: "TRAILER"}),
            video("3", "Bearbetas", {published: false, status: "PROCESSING", renditions: []}),
        ],
        progress: {},
        watchList: new Set(),
    };
}

resetState();

const isEditor = persona => persona.roles.includes("EDITOR") || persona.roles.includes("ADMIN");
const forbidden = () => new GraphQLError("FORBIDDEN", "Du har inte behörighet att göra det.");

function requireUser(persona) {
    if (!persona) {
        throw new GraphQLError("UNAUTHORIZED", "Du är inte inloggad.");
    }
    if (!persona.roles.includes("USER")) {
        throw forbidden();
    }
    return persona;
}

const listed = v => v.published && v.status === "READY" && !v.trashedAt;
const visible = persona => state.videos.filter(v => !v.trashedAt && (listed(v) || isEditor(persona)));
const personal = v => ({...v, progressSeconds: state.progress[v.id] ?? null, finished: false, inWatchList: state.watchList.has(v.id)});
const settings = {welcomeSv: null, welcomeEn: null, maxUploadGb: 50, keepOriginals: true};
const categories = [{id: "1", name: "Chalmersspexet", videoCount: 1}];

const resolvers = {
    Me: persona => ({me: {username: persona.email, displayName: persona.name, roles: persona.roles, spexifyUser: true}, settings}),
    Home: () => ({
        continueWatching: state.videos.filter(v => listed(v) && state.progress[v.id]).map(personal),
        recentVideos: state.videos.filter(listed).map(personal),
        categories, years: [1975],
    }),
    Videos: (persona, {filter}) => ({
        videos: visible(persona).filter(v => listed(v) || filter?.includeUnpublished).map(personal), categories, years: [1975],
    }),
    Video: (persona, {id}) => ({video: visible(persona).filter(v => v.id === id).map(personal)[0] ?? null}),
    Playback: (persona, {videoId}) => ({
        playback: {masterUrl: `http://localhost:${PORT}/media/${videoId}/master.m3u8`, thumbnailsUrl: null, subtitles: [],
            expiresAt: new Date(Date.now() + 3600000).toISOString()},
    }),
    Search: (persona, {q}) => ({search: visible(persona).filter(v => v.title.toLowerCase().includes(q.toLowerCase())).map(personal)}),
    WatchList: () => ({watchList: state.videos.filter(v => state.watchList.has(v.id)).map(personal)}),
    WatchListAdd: (persona, {videoId}) => {
        state.watchList.add(videoId);
        return {watchListAdd: null};
    },
    WatchListRemove: (persona, {videoId}) => {
        state.watchList.delete(videoId);
        return {watchListRemove: null};
    },
    ProgressSave: (persona, {videoId, positionSeconds}) => {
        state.progress[videoId] = positionSeconds;
        return {progressSave: null};
    },
    SpexSearch: persona => {
        if (!isEditor(persona)) {
            throw forbidden();
        }
        return {spexSearch: [{id: SPEX.id, title: SPEX.title, year: SPEX.year, revival: false, categoryName: SPEX.categoryName}]};
    },
    SpexifyTracks: () => ({spexifyTracks: [{id: "12", title: "Kärleksduetten", discNumber: 1, trackNumber: 2, albumTitle: "Nobel"}]}),
    VideoCreate: (persona, {input}) => {
        if (!isEditor(persona)) {
            throw forbidden();
        }

        const created = video(String(state.nextId++), input.title || SPEX.title, {
            published: false, status: "UPLOADING", renditions: [], chapters: [], originalName: null, durationMs: null, kind: input.kind,
        });

        state.videos.push(created);
        return {videoCreate: {id: created.id}};
    },
    VideoPublish: (persona, {id, published}) => {
        state.videos.find(v => v.id === id).published = published;
        return {videoPublish: {id}};
    },
    Queue: () => ({processingQueue: [{id: "1", videoId: "3", videoTitle: "Bearbetas", status: "RUNNING", progress: 40, attempts: 1,
        error: null, createdAt: "2026-10-31T10:00:00Z", startedAt: "2026-10-31T10:00:00Z", finishedAt: null}]}),
    Storage: persona => {
        if (!persona.roles.includes("ADMIN")) {
            throw forbidden();
        }
        return {storage: {originalsBytes: 5e9, renditionsBytes: 3e9, freeBytes: 2e11, videoCount: 3}};
    },
};

function operationNameOf(query) {
    const match = /\b(query|mutation)\s+([A-Za-z0-9_]+)/.exec(query);
    return match ? match[2] : null;
}

function personaOf(req) {
    const token = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
    try {
        const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
        return bySub[payload.sub] ?? null;
    } catch {
        return null;
    }
}

function handleGraphql(req, body, res) {
    let payload;
    try {
        payload = JSON.parse(body);
    } catch {
        res.writeHead(400).end('{"errors":[{"message":"bad json"}]}');
        return;
    }
    const op = operationNameOf(payload.query || "");
    const resolver = op && resolvers[op];
    res.writeHead(200, {"content-type": "application/json"});
    if (!resolver) {
        res.end(JSON.stringify({data: {}}));
        return;
    }
    try {
        const persona = requireUser(personaOf(req));
        res.end(JSON.stringify({data: resolver(persona, payload.variables || {})}));
    } catch (error) {
        if (error instanceof GraphQLError) {
            res.end(JSON.stringify({
                data: null,
                errors: [{message: error.message, extensions: {classification: error.classification}}]
            }));
        } else {
            console.error(error);
            res.end(JSON.stringify({
                data: null,
                errors: [{message: String(error), extensions: {classification: "INTERNAL_ERROR"}}]
            }));
        }
    }
}

// --- OIDC ----------------------------------------------------------------------------------------------------------

const oidcConfig = {
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/protocol/openid-connect/auth`,
    token_endpoint: `${ISSUER}/protocol/openid-connect/token`,
    userinfo_endpoint: `${ISSUER}/protocol/openid-connect/userinfo`,
    jwks_uri: `${ISSUER}/protocol/openid-connect/certs`,
    end_session_endpoint: `${ISSUER}/protocol/openid-connect/logout`,
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
};

const {privateKey, publicKey} = await generateKeyPair("RS256", {extractable: true});
const publicJwk = {...(await exportJWK(publicKey)), kid: KID, alg: "RS256", use: "sig"};
const pendingCodes = new Map();

const userClaims = persona => ({
    sub: persona.sub,
    name: persona.name,
    email: persona.email,
    email_verified: true,
    preferred_username: persona.email
});

const signJwt = (persona, claims, audience) =>
    new SignJWT(claims)
        .setProtectedHeader({alg: "RS256", kid: KID, typ: "JWT"})
        .setIssuer(ISSUER)
        .setSubject(persona.sub)
        .setAudience(audience)
        .setIssuedAt()
        .setExpirationTime(`${TOKEN_TTL}s`)
        .sign(privateKey);

function handleAuthorize(url, res) {
    const redirectUri = url.searchParams.get("redirect_uri");
    if (!redirectUri) {
        res.writeHead(400).end("missing redirect_uri");
        return;
    }
    const code = randomUUID();
    pendingCodes.set(code, {nonce: url.searchParams.get("nonce"), persona: PERSONAS[currentPersona]});
    const target = new URL(redirectUri);
    target.searchParams.set("code", code);
    const stateParam = url.searchParams.get("state");
    if (stateParam) {
        target.searchParams.set("state", stateParam);
    }
    res.writeHead(302, {location: target.toString()}).end();
}

async function handleToken(body, res) {
    const params = new URLSearchParams(body);
    let pending = {nonce: null, persona: PERSONAS[currentPersona]};

    if (params.get("grant_type") === "authorization_code") {
        const code = params.get("code");
        if (!pendingCodes.has(code)) {
            res.writeHead(400, {"content-type": "application/json"}).end(JSON.stringify({error: "invalid_grant"}));
            return;
        }
        pending = pendingCodes.get(code);
        pendingCodes.delete(code);
    }
    const {persona, nonce} = pending;
    res.writeHead(200, {"content-type": "application/json"});
    res.end(JSON.stringify({
        access_token: await signJwt(persona, {
            ...userClaims(persona),
            typ: "Bearer",
            azp: CLIENT_ID,
            resource_access: {[CLIENT_ID]: {roles: persona.roles}}
        }, "account"),
        id_token: await signJwt(persona, {...userClaims(persona), ...(nonce ? {nonce} : {})}, CLIENT_ID),
        refresh_token: `refresh-${randomUUID()}`,
        token_type: "Bearer",
        expires_in: TOKEN_TTL,
        scope: "openid profile email",
    }));
}

const server = createServer((req, res) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", async () => {
        const url = new URL(req.url || "", `http://localhost:${PORT}`);
        const path = url.pathname;
        const body = Buffer.concat(chunks).toString("utf8");

        if (path.endsWith("/.well-known/openid-configuration")) {
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify(oidcConfig));
        } else if (path.endsWith("/protocol/openid-connect/certs")) {
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify({keys: [publicJwk]}));
        } else if (path.endsWith("/protocol/openid-connect/auth")) {
            handleAuthorize(url, res);
        } else if (path.endsWith("/protocol/openid-connect/token")) {
            await handleToken(body, res);
        } else if (path.endsWith("/protocol/openid-connect/userinfo")) {
            const persona = personaOf(req) ?? PERSONAS[currentPersona];
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify(userClaims(persona)));
        } else if (path.endsWith("/protocol/openid-connect/logout")) {
            res.writeHead(302, {location: url.searchParams.get("post_logout_redirect_uri") || `http://localhost:${PORT}/`}).end();
        } else if (req.method === "POST" && path === "/__reset") {
            resetState();
            currentPersona = "admin";
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__persona") {
            currentPersona = JSON.parse(body).persona;
            res.writeHead(204).end();
        } else if (req.method === "GET" && /^\/api\/videos\/[^/]+\/poster$/.test(path)) {
            res.writeHead(404).end();
        } else if (req.method === "GET" && path.startsWith("/media/")) {
            res.writeHead(200, {"content-type": "application/vnd.apple.mpegurl", "access-control-allow-origin": "*"}).end("#EXTM3U\n");
        } else if (req.method === "POST" && path.includes("/api/graphql")) {
            handleGraphql(req, body, res);
        } else {
            res.writeHead(404).end();
        }
    });
});

server.listen(PORT, () => {
    console.log(`[mock-backend] listening on http://localhost:${PORT}`);
});
