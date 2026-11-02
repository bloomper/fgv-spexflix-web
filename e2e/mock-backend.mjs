// A stand-in for Spexflix Server and Keycloak in E2E tests: GraphQL for videos, watching, editing and administration,
// tus uploads, posters, subtitles and the media server, and a mini-Keycloak (discovery, authorize, token, JWKS, userinfo, logout).
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

// As Spexflix Server words them
const MESSAGES = {
    CONFLICT: "Någon annan har ändrat detta. Ladda om sidan och försök igen.",
    SPEXREGISTER_UNAVAILABLE: "Spexregistret går inte att nå just nu. Försök igen om en stund.",
};

class GraphQLError extends Error {
    constructor(classification, message) {
        super(message);
        this.classification = classification;
    }
}

/** The UUID the server would give the entity numbered n here. */
const uuidOf = n => `00000000-0000-7000-8000-${String(n).padStart(12, "0")}`;

const SPEX = {id: uuidOf(1), title: "Nobel", year: 1975, revival: false, categoryId: uuidOf(1), categoryName: "Chalmersspexet"};

function video(id, title, extra = {}) {
    return {
        id, title, year: 1975, kindId: uuidOf(901), performance: "Premiären", performanceDate: "1975-02-14",
        description: "Inspelat 1975.", spex: SPEX, status: "READY", failure: null, durationMs: 60000, width: 1280, height: 720,
        published: true, publishedAt: "2026-10-01T10:00:00Z", trashedAt: null, originalName: "nobel.mp4", originalSize: 1000000,
        originalKept: true, hasThumbnails: false, posterSeconds: null,
        renditions: [{height: 720, width: 1280, bitrateKbps: 3000, copied: true, size: 1000}],
        chapters: [{startSeconds: 0, title: "Ouvertyr", spexifyTrackId: null, spexifyTrackTitle: null},
            {startSeconds: 20, title: "Kärleksduetten", spexifyTrackId: uuidOf(12), spexifyTrackTitle: "Kärleksduetten"}],
        subtitles: [], createdAt: "2026-10-01T10:00:00Z", lastModifiedAt: null, job: null, ...extra,
    };
}

let state;

function resetState() {
    state = {
        nextId: 100,
        maintenanceJobs: [
            {job: "SPEX_REFRESH", schedule: "0 15 3 * * *", running: false, lastStartedAt: null, lastFinishedAt: null, lastSucceeded: null},
            {job: "UPLOAD_CLEANUP", schedule: "0 5 * * * *", running: true, lastStartedAt: "2026-11-01T10:05:00Z", lastFinishedAt: null, lastSucceeded: null},
        ],
        kinds: [
            {id: uuidOf(901), nameSv: "Föreställning", nameEn: "Show", position: 1},
            {id: uuidOf(902), nameSv: "Nummer", nameEn: "Number", position: 2},
            {id: uuidOf(903), nameSv: "Trailer", nameEn: "Trailer", position: 3},
            {id: uuidOf(904), nameSv: "Bakom kulisserna", nameEn: "Behind the scenes", position: 4},
            {id: uuidOf(905), nameSv: "Övrigt", nameEn: "Other", position: 5},
        ],
        videos: [
            video(uuidOf(1), "Nobel"),
            video(uuidOf(2), "Opublicerad film", {published: false, kindId: uuidOf(903)}),
            video(uuidOf(3), "Bearbetas", {published: false, status: "PROCESSING", renditions: []}),
        ],
        progress: {},
        // The viewer's ratings by video id, and everyone else's
        ratings: {},
        otherRatings: {[uuidOf(1)]: [5]},
        watchList: new Set(),
        settings: {welcomeSv: null, welcomeEn: null, maxUploadGb: 50, keepOriginals: true},
        audit: [],
        uploads: new Map(),
        spexregisterUp: true,
        spexifyUp: true,
        failNext: new Map(),
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
const sortedKinds = () => [...state.kinds].sort((a, b) => a.position - b.position);
const kindOf = kindId => ({...state.kinds.find(kind => kind.id === kindId), isDefault: sortedKinds()[0]?.id === kindId});
const ratingsOf = id => [...(state.otherRatings[id] ?? []), ...(state.ratings[id] ? [state.ratings[id]] : [])];
const personal = v => ({...v, kind: kindOf(v.kindId), myRating: state.ratings[v.id] ?? 0,
    averageRating: ratingsOf(v.id).length ? ratingsOf(v.id).reduce((a, b) => a + b, 0) / ratingsOf(v.id).length : null,
    ratingCount: ratingsOf(v.id).length, progressSeconds: state.progress[v.id] ?? null, finished: false, inWatchList: state.watchList.has(v.id)});
const isAdmin = persona => persona.roles.includes("ADMIN");

function requireEditor(persona) {
    if (!isEditor(persona)) {
        throw forbidden();
    }
}

function requireAdmin(persona) {
    if (!isAdmin(persona)) {
        throw forbidden();
    }
}

function audit(persona, action, entityId, summary) {
    state.audit.unshift({id: String(state.nextId++), at: new Date().toISOString(), actorName: persona.name, action,
        entityType: "VIDEO", entityId, summary, actor: persona.sub});
}

const videoById = id => {
    const found = state.videos.find(candidate => candidate.id === id);

    if (!found) {
        throw new GraphQLError("NOT_FOUND", "Filmen finns inte.");
    }
    return found;
};
const queue = (target, source) => {
    target.status = "PROCESSING";
    target.job = {id: String(state.nextId++), videoId: target.id, videoTitle: target.title, status: "QUEUED", progress: 0, attempts: 0,
        error: null, createdAt: new Date().toISOString(), startedAt: null, finishedAt: null};
    target.originalName = source ?? target.originalName;
};
const categories = [{id: uuidOf(1), name: "Chalmersspexet", videoCount: 1}];

const resolvers = {
    Me: persona => ({me: {username: persona.email, displayName: persona.name, roles: persona.roles, spexifyUser: true}, settings: state.settings}),
    Home: () => ({
        continueWatching: state.videos.filter(v => listed(v) && state.progress[v.id]).map(personal),
        highestRated: state.videos.filter(v => listed(v) && state.ratings[v.id]).sort((a, b) => state.ratings[b.id] - state.ratings[a.id]).map(personal),
        recentVideos: state.videos.filter(listed).map(personal),
        categories, years: [1975],
    }),
    Videos: (persona, {filter}) => ({
        videos: visible(persona).filter(v => listed(v) || filter?.includeUnpublished).filter(v => !filter?.kindId || v.kindId === filter.kindId).map(personal),
        categories, years: [1975], videoKinds: sortedKinds().map(kind => kindOf(kind.id)),
    }),
    Video: (persona, {id}) => ({video: visible(persona).filter(v => v.id === id).map(personal)[0] ?? null}),
    Playback: (persona, {videoId}) => {
        const found = videoById(videoId);

        if (found.status !== "READY") {
            throw new GraphQLError("BAD_REQUEST", "Filmen är inte färdigbearbetad.");
        }
        return {playback: {masterUrl: `http://localhost:${PORT}/media/${videoId}/master.m3u8`, thumbnailsUrl: null,
            subtitles: found.subtitles.map(sub => ({...sub, url: `http://localhost:${PORT}/media/${videoId}/subtitles/${sub.language}.vtt`})),
            expiresAt: new Date(Date.now() + 3600000).toISOString()}};
    },
    Search: (persona, {q}) => ({search: visible(persona).filter(v => v.title.toLowerCase().includes(q.toLowerCase())).map(personal)}),
    WatchList: () => ({watchList: state.videos.filter(v => state.watchList.has(v.id)).map(personal)}),
    VideoRate: (persona, {videoId, rating}) => {
        if (rating === 0) {
            delete state.ratings[videoId];
        } else {
            state.ratings[videoId] = rating;
        }
        return {videoRate: null};
    },
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
        requireEditor(persona);
        if (!state.spexregisterUp) {
            throw new GraphQLError("SPEXREGISTER_UNAVAILABLE", MESSAGES.SPEXREGISTER_UNAVAILABLE);
        }
        return {spexSearch: [{id: SPEX.id, title: SPEX.title, year: SPEX.year, revival: false, categoryName: SPEX.categoryName}]};
    },
    // Empty while Spexify is down, as the server answers
    SpexifyTracks: persona => {
        requireEditor(persona);
        return {spexifyTracks: state.spexifyUp ? [{id: uuidOf(12), title: "Kärleksduetten", discNumber: 1, trackNumber: 2, albumTitle: "Nobel"}] : []};
    },
    VideoCreate: (persona, {input}) => {
        if (!isEditor(persona)) {
            throw forbidden();
        }

        const created = video(uuidOf(state.nextId++), input.title || SPEX.title, {
            published: false, status: "UPLOADING", renditions: [], chapters: [], originalName: null, durationMs: null, kindId: input.kindId ?? sortedKinds()[0].id,
        });

        state.videos.push(created);
        audit(persona, "CREATE", created.id, `Skapade filmen ${created.title}`);
        return {videoCreate: {id: created.id}};
    },
    VideoPublish: (persona, {id, published}) => {
        requireEditor(persona);

        const found = videoById(id);

        if (published && found.status !== "READY") {
            throw new GraphQLError("BAD_REQUEST", "Filmen kan publiceras när den är färdigbearbetad.");
        }
        found.published = published;
        audit(persona, published ? "PUBLISH" : "UNPUBLISH", id, `${published ? "Publicerade" : "Avpublicerade"} filmen ${found.title}`);
        return {videoPublish: {id}};
    },
    VideoUpdate: (persona, {id, input}) => {
        requireEditor(persona);

        const found = videoById(id);

        Object.assign(found, {title: input.title || found.title, year: input.year ?? found.year, kindId: input.kindId ?? found.kindId,
            performance: input.performance ?? null, performanceDate: input.performanceDate ?? null, description: input.description ?? null});
        audit(persona, "UPDATE", id, `Ändrade filmen ${found.title}`);
        return {videoUpdate: {id}};
    },
    VideoSetFile: (persona, {id, uploadId}) => {
        requireEditor(persona);

        const found = videoById(id);
        const upload = state.uploads.get(uploadId);

        if (!upload || upload.offset < upload.length) {
            throw new GraphQLError("BAD_REQUEST", "Uppladdningen är inte klar.");
        }
        state.uploads.delete(uploadId);
        queue(found, upload.name);
        audit(persona, "UPLOAD", id, `Laddade upp filen till ${found.title}`);
        return {videoSetFile: {id}};
    },
    VideoReprocess: (persona, {id}) => {
        requireAdmin(persona);
        queue(videoById(id));
        return {videoReprocess: {id}};
    },
    VideoPosterFrame: (persona, {id, seconds}) => {
        requireEditor(persona);
        videoById(id).posterSeconds = seconds;
        return {videoPosterFrame: {id}};
    },
    ChaptersSet: (persona, {videoId, chapters}) => {
        requireEditor(persona);
        videoById(videoId).chapters = [...chapters].sort((a, b) => a.startSeconds - b.startSeconds)
            .map(chapter => ({spexifyTrackId: null, spexifyTrackTitle: null, ...chapter}));
        return {chaptersSet: {id: videoId}};
    },
    SubtitleRemove: (persona, {videoId, language}) => {
        requireEditor(persona);

        const found = videoById(videoId);

        found.subtitles = found.subtitles.filter(sub => sub.language !== language);
        return {subtitleRemove: {id: videoId}};
    },
    VideoTrash: (persona, {id}) => {
        requireEditor(persona);

        const found = videoById(id);

        found.trashedAt = new Date().toISOString();
        audit(persona, "TRASH", id, `Lade filmen ${found.title} i papperskorgen`);
        return {videoTrash: {id}};
    },
    VideoRestore: (persona, {id}) => {
        requireEditor(persona);
        videoById(id).trashedAt = null;
        return {videoRestore: {id}};
    },
    VideoDelete: (persona, {id}) => {
        requireAdmin(persona);
        state.videos = state.videos.filter(v => v.id !== id);
        return {videoDelete: null};
    },
    TrashEmpty: persona => {
        requireAdmin(persona);
        state.videos = state.videos.filter(v => !v.trashedAt);
        return {trashEmpty: null};
    },
    VideoKinds: persona => {
        if (!persona) {
            throw new GraphQLError("UNAUTHORIZED", "Du är inte inloggad.");
        }
        return {videoKinds: sortedKinds().map(kind => ({...kindOf(kind.id), videoCount: state.videos.filter(v => v.kindId === kind.id).length}))};
    },
    VideoKindCreate: (persona, {input}) => {
        requireAdmin(persona);

        const kind = {id: uuidOf(state.nextId++), nameSv: input.nameSv, nameEn: input.nameEn, position: state.kinds.length + 1};

        state.kinds.push(kind);
        return {videoKindCreate: {id: kind.id}};
    },
    VideoKindUpdate: (persona, {id, input}) => {
        requireAdmin(persona);
        Object.assign(state.kinds.find(kind => kind.id === id), {nameSv: input.nameSv, nameEn: input.nameEn});
        return {videoKindUpdate: {id}};
    },
    VideoKindsReorder: (persona, {ids}) => {
        requireAdmin(persona);
        ids.forEach((id, i) => state.kinds.find(kind => kind.id === id).position = i + 1);
        return {videoKindsReorder: ids.map(id => ({id}))};
    },
    VideoKindDelete: (persona, {id}) => {
        requireAdmin(persona);

        const count = state.videos.filter(v => v.kindId === id).length;

        if (count > 0) {
            throw new GraphQLError("CONFLICT", `Filmsorten används av ${count} filmer och kan inte raderas.`);
        }
        state.kinds = state.kinds.filter(kind => kind.id !== id);
        return {videoKindDelete: null};
    },
    Trash: persona => {
        requireEditor(persona);
        return {trash: state.videos.filter(v => v.trashedAt).map(personal)};
    },
    AuditLog: (persona, {page = 0, size = 50}) => {
        requireEditor(persona);

        const entries = state.audit.filter(entry => isAdmin(persona) || entry.actor === persona.sub);

        return {auditLog: {entries: entries.slice(page * size, (page + 1) * size), totalCount: entries.length, page, size}};
    },
    Settings: () => ({settings: state.settings}),
    SettingsUpdate: (persona, {input}) => {
        requireAdmin(persona);
        if (input.maxUploadGb < 1) {
            throw new GraphQLError("BAD_REQUEST", "Uppgifterna är inte giltiga.");
        }
        state.settings = {...input};
        return {settingsUpdate: state.settings};
    },
    Queue: persona => {
        requireEditor(persona);
        return {processingQueue: [{id: "1", videoId: uuidOf(3), videoTitle: "Bearbetas", status: "RUNNING", progress: 40, attempts: 1,
            error: null, createdAt: "2026-10-31T10:00:00Z", startedAt: "2026-10-31T10:00:00Z", finishedAt: null},
            ...state.videos.filter(v => v.job).map(v => v.job)]};
    },
    MaintenanceJobs: persona => {
        requireAdmin(persona);
        return {maintenanceJobs: state.maintenanceJobs};
    },
    MaintenanceJobRun: (persona, {job}) => {
        requireAdmin(persona);
        const status = state.maintenanceJobs.find(j => j.job === job);

        if (!status || status.running) {
            return {maintenanceJobRun: false};
        }
        status.lastStartedAt = "2026-11-01T12:00:00Z";
        status.lastFinishedAt = "2026-11-01T12:00:01Z";
        status.lastSucceeded = true;
        return {maintenanceJobRun: true};
    },
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
        const failure = state.failNext.get(op);

        if (failure) {
            state.failNext.delete(op);
            throw new GraphQLError(failure, MESSAGES[failure] ?? "Något gick fel.");
        }
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

function multipartField(body, name) {
    const match = new RegExp(`name="${name}"\r\n\r\n([^\r]*)`).exec(body);

    return match ? match[1] : null;
}

// --- tus ------------------------------------------------------------------------------------------------------------

function handleTus(req, path, body, res) {
    const headers = {"tus-resumable": "1.0.0"};
    const id = path.split("/")[3];
    const persona = personaOf(req);

    if (req.method === "OPTIONS") {
        res.writeHead(204, {...headers, "tus-version": "1.0.0", "tus-extension": "creation,termination", "tus-max-size": "53687091200"}).end();
    } else if (!persona || !isEditor(persona)) {
        res.writeHead(403, {"content-type": "application/json"}).end(JSON.stringify({code: "FORBIDDEN", message: "Du har inte behörighet att göra det."}));
    } else if (req.method === "POST") {
        const upload = randomUUID();
        const metadata = Object.fromEntries((req.headers["upload-metadata"] ?? "").split(",").filter(Boolean)
            .map(pair => pair.trim().split(" ")).map(([key, value]) => [key, Buffer.from(value ?? "", "base64").toString("utf8")]));

        state.uploads.set(upload, {name: metadata.filename ?? "upload", length: Number(req.headers["upload-length"]), offset: 0});
        res.writeHead(201, {...headers, location: `/api/uploads/${upload}`}).end();
    } else if (!state.uploads.has(id)) {
        res.writeHead(404, headers).end();
    } else if (req.method === "HEAD") {
        const upload = state.uploads.get(id);

        res.writeHead(200, {...headers, "upload-offset": String(upload.offset), "upload-length": String(upload.length), "cache-control": "no-store"}).end();
    } else if (req.method === "PATCH") {
        const upload = state.uploads.get(id);

        if (Number(req.headers["upload-offset"]) !== upload.offset) {
            res.writeHead(409, headers).end();
            return;
        }
        upload.offset += body.length;
        res.writeHead(204, {...headers, "upload-offset": String(upload.offset)}).end();
    } else if (req.method === "DELETE") {
        state.uploads.delete(id);
        res.writeHead(204, headers).end();
    } else {
        res.writeHead(405).end();
    }
}

const server = createServer((req, res) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => handle(req, res, chunks).catch(error => {
        // A broken handler answers 500 instead of taking the mock down for every later test
        console.error(error);
        if (!res.headersSent) {
            res.writeHead(500).end();
        }
    }));
});

async function handle(req, res, chunks) {
    {
        const url = new URL(req.url || "", `http://localhost:${PORT}`);
        const path = url.pathname;
        const rawBody = Buffer.concat(chunks);
        const body = rawBody.toString("utf8");

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
        } else if (req.method === "POST" && path === "/__spexregister") {
            state.spexregisterUp = JSON.parse(body).up;
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__spexify") {
            state.spexifyUp = JSON.parse(body).up;
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__fail") {
            const {operation, classification} = JSON.parse(body);

            state.failNext.set(operation, classification);
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__process") {
            // The worker finishes, or fails, every queued job
            const {failure} = JSON.parse(body || "{}");

            state.videos.filter(v => v.job && v.job.status !== "DONE").forEach(v => {
                Object.assign(v.job, {status: failure ? "FAILED" : "DONE", progress: 100, finishedAt: new Date().toISOString(), error: failure ?? null});
                Object.assign(v, failure ? {status: "FAILED", failure} : {status: "READY", failure: null, durationMs: 60000,
                    renditions: [{height: 720, width: 1280, bitrateKbps: 3000, copied: false, size: 1000}]});
            });
            res.writeHead(204).end();
        } else if (req.method === "POST" && path === "/__progress") {
            const {videoId, seconds} = JSON.parse(body);

            state.progress[videoId] = seconds;
            res.writeHead(204).end();
        } else if (req.method === "GET" && path === "/__state") {
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify({
                uploads: state.uploads.size, progress: state.progress, kinds: state.kinds, ratings: state.ratings,
                videos: state.videos.map(({id, title, status, published, trashedAt, posterSeconds, chapters, subtitles, job}) =>
                    ({id, title, status, published, trashedAt, posterSeconds, chapters, subtitles, jobStatus: job?.status ?? null})),
            }));
        } else if (path === "/api/uploads" || path.startsWith("/api/uploads/")) {
            handleTus(req, path, rawBody, res);
        } else if (req.method === "POST" && /^\/api\/videos\/[^/]+\/(poster|subtitles)$/.test(path)) {
            const found = state.videos.find(v => v.id === path.split("/")[3]);

            if (!isEditor(personaOf(req) ?? {roles: []})) {
                res.writeHead(403, {"content-type": "application/json"}).end(JSON.stringify({code: "FORBIDDEN", message: "Du har inte behörighet att göra det."}));
                return;
            }
            if (path.endsWith("/subtitles")) {
                const language = multipartField(body, "language");

                if (!/-->/.test(body)) {
                    res.writeHead(400, {"content-type": "application/json"}).end(JSON.stringify({code: "BAD_REQUEST", message: "Filen är inte WebVTT eller SRT."}));
                    return;
                }
                found.subtitles = [...found.subtitles.filter(sub => sub.language !== language), {language, label: multipartField(body, "label")}];
            } else {
                found.posterUploaded = true;
            }
            res.writeHead(200, {"content-type": "application/json"}).end(JSON.stringify({id: found.id, title: found.title, subtitles: found.subtitles}));
        } else if (req.method === "GET" && /^\/api\/videos\/[^/]+\/poster$/.test(path)) {
            res.writeHead(404).end();
        } else if (req.method === "GET" && path.startsWith("/media/")) {
            res.writeHead(200, {"content-type": "application/vnd.apple.mpegurl", "access-control-allow-origin": "*"}).end("#EXTM3U\n");
        } else if (req.method === "POST" && path.includes("/api/graphql")) {
            handleGraphql(req, body, res);
        } else {
            res.writeHead(404).end();
        }
    }
}

server.listen(PORT, () => {
    console.log(`[mock-backend] listening on http://localhost:${PORT}`);
});
