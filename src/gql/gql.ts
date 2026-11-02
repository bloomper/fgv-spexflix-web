/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    query Trash { trash { id title year trashedAt status } }\n": typeof types.TrashDocument,
    "\n    query Queue {\n        processingQueue { id videoId videoTitle status progress attempts error createdAt startedAt finishedAt }\n    }\n": typeof types.QueueDocument,
    "\n    query Storage { storage { originalsBytes renditionsBytes freeBytes videoCount } }\n": typeof types.StorageDocument,
    "\n    query AuditLog($page: Int, $size: Int) {\n        auditLog(page: $page, size: $size) {\n            totalCount page size\n            entries { id at actorName action entityType entityId summary }\n        }\n    }\n": typeof types.AuditLogDocument,
    "\n    query Settings { settings { welcomeSv welcomeEn maxUploadGb keepOriginals } }\n": typeof types.SettingsDocument,
    "mutation TrashEmpty { trashEmpty }": typeof types.TrashEmptyDocument,
    "\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { welcomeSv } }\n": typeof types.SettingsUpdateDocument,
    "\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n": typeof types.MaintenanceJobsDocument,
    "mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }": typeof types.MaintenanceJobRunDocument,
    "\n    fragment KindFields on VideoKind { id nameSv nameEn isDefault }\n": typeof types.KindFieldsFragmentDoc,
    "\n    query Me {\n        me { username displayName roles spexifyUser }\n        settings { welcomeSv welcomeEn maxUploadGb keepOriginals }\n    }\n": typeof types.MeDocument,
    "\n    query Home {\n        continueWatching(limit: 12) { id title year kind { ...KindFields } durationMs progressSeconds finished spex { categoryName revival } }\n        highestRated(limit: 12) { id title year kind { ...KindFields } durationMs progressSeconds finished myRating spex { categoryName revival } }\n        recentVideos(limit: 12) { id title year kind { ...KindFields } durationMs progressSeconds finished spex { categoryName revival } }\n        categories { id name videoCount }\n        years\n    }\n": typeof types.HomeDocument,
    "\n    query Videos($filter: VideoFilter) {\n        videos(filter: $filter) {\n            id title year kind { ...KindFields } durationMs status published progressSeconds finished\n            spex { id categoryName revival }\n        }\n        categories { id name videoCount }\n        years\n        videoKinds { ...KindFields }\n    }\n": typeof types.VideosDocument,
    "\n    query VideoKinds {\n        videoKinds { ...KindFields position videoCount }\n    }\n": typeof types.VideoKindsDocument,
    "\n    query Video($id: ID!) {\n        video(id: $id) {\n            id title year kind { ...KindFields } performance performanceDate description status failure durationMs width height\n            published publishedAt trashedAt originalName originalSize originalKept hasThumbnails posterSeconds\n            progressSeconds finished inWatchList myRating averageRating ratingCount createdAt lastModifiedAt\n            spex { id title year revival categoryId categoryName }\n            renditions { height width bitrateKbps copied size }\n            chapters { startSeconds title spexifyTrackId spexifyTrackTitle }\n            subtitles { language label }\n            job { id status progress attempts error createdAt startedAt finishedAt }\n        }\n    }\n": typeof types.VideoDocument,
    "\n    query Playback($videoId: ID!) {\n        playback(videoId: $videoId) { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }\n    }\n": typeof types.PlaybackDocument,
    "\n    query Search($q: String!) {\n        search(q: $q) { id title year kind { ...KindFields } durationMs status published progressSeconds finished spex { categoryName revival } }\n    }\n": typeof types.SearchDocument,
    "\n    query WatchList {\n        watchList { id title year kind { ...KindFields } durationMs progressSeconds finished spex { categoryName revival } }\n    }\n": typeof types.WatchListDocument,
    "\n    query SpexSearch($q: String!) { spexSearch(q: $q) { id title year revival categoryName } }\n": typeof types.SpexSearchDocument,
    "\n    query SpexifyTracks($videoId: ID!) { spexifyTracks(videoId: $videoId) { id title discNumber trackNumber albumTitle } }\n": typeof types.SpexifyTracksDocument,
    "mutation VideoKindCreate($input: VideoKindInput!) { videoKindCreate(input: $input) { id } }": typeof types.VideoKindCreateDocument,
    "mutation VideoKindUpdate($id: ID!, $input: VideoKindInput!) { videoKindUpdate(id: $id, input: $input) { id } }": typeof types.VideoKindUpdateDocument,
    "mutation VideoKindsReorder($ids: [ID!]!) { videoKindsReorder(ids: $ids) { id } }": typeof types.VideoKindsReorderDocument,
    "mutation VideoKindDelete($id: ID!) { videoKindDelete(id: $id) }": typeof types.VideoKindDeleteDocument,
    "mutation VideoCreate($input: VideoInput!) { videoCreate(input: $input) { id } }": typeof types.VideoCreateDocument,
    "mutation VideoUpdate($id: ID!, $input: VideoInput!) { videoUpdate(id: $id, input: $input) { id } }": typeof types.VideoUpdateDocument,
    "mutation VideoSetFile($id: ID!, $uploadId: String!) { videoSetFile(id: $id, uploadId: $uploadId) { id status } }": typeof types.VideoSetFileDocument,
    "mutation VideoPublish($id: ID!, $published: Boolean!) { videoPublish(id: $id, published: $published) { id } }": typeof types.VideoPublishDocument,
    "mutation VideoTrash($id: ID!) { videoTrash(id: $id) { id } }": typeof types.VideoTrashDocument,
    "mutation VideoRestore($id: ID!) { videoRestore(id: $id) { id } }": typeof types.VideoRestoreDocument,
    "mutation VideoDelete($id: ID!) { videoDelete(id: $id) }": typeof types.VideoDeleteDocument,
    "mutation VideoPosterFrame($id: ID!, $seconds: Float!) { videoPosterFrame(id: $id, seconds: $seconds) { id } }": typeof types.VideoPosterFrameDocument,
    "mutation VideoReprocess($id: ID!) { videoReprocess(id: $id) { id } }": typeof types.VideoReprocessDocument,
    "mutation ChaptersSet($videoId: ID!, $chapters: [ChapterInput!]!) { chaptersSet(videoId: $videoId, chapters: $chapters) { id } }": typeof types.ChaptersSetDocument,
    "mutation SubtitleRemove($videoId: ID!, $language: String!) { subtitleRemove(videoId: $videoId, language: $language) { id } }": typeof types.SubtitleRemoveDocument,
    "mutation ProgressSave($videoId: ID!, $positionSeconds: Int!) { progressSave(videoId: $videoId, positionSeconds: $positionSeconds) }": typeof types.ProgressSaveDocument,
    "mutation VideoRate($videoId: ID!, $rating: Int!) { videoRate(videoId: $videoId, rating: $rating) }": typeof types.VideoRateDocument,
    "mutation WatchListAdd($videoId: ID!) { watchListAdd(videoId: $videoId) }": typeof types.WatchListAddDocument,
    "mutation WatchListRemove($videoId: ID!) { watchListRemove(videoId: $videoId) }": typeof types.WatchListRemoveDocument,
};
const documents: Documents = {
    "\n    query Trash { trash { id title year trashedAt status } }\n": types.TrashDocument,
    "\n    query Queue {\n        processingQueue { id videoId videoTitle status progress attempts error createdAt startedAt finishedAt }\n    }\n": types.QueueDocument,
    "\n    query Storage { storage { originalsBytes renditionsBytes freeBytes videoCount } }\n": types.StorageDocument,
    "\n    query AuditLog($page: Int, $size: Int) {\n        auditLog(page: $page, size: $size) {\n            totalCount page size\n            entries { id at actorName action entityType entityId summary }\n        }\n    }\n": types.AuditLogDocument,
    "\n    query Settings { settings { welcomeSv welcomeEn maxUploadGb keepOriginals } }\n": types.SettingsDocument,
    "mutation TrashEmpty { trashEmpty }": types.TrashEmptyDocument,
    "\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { welcomeSv } }\n": types.SettingsUpdateDocument,
    "\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n": types.MaintenanceJobsDocument,
    "mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }": types.MaintenanceJobRunDocument,
    "\n    fragment KindFields on VideoKind { id nameSv nameEn isDefault }\n": types.KindFieldsFragmentDoc,
    "\n    query Me {\n        me { username displayName roles spexifyUser }\n        settings { welcomeSv welcomeEn maxUploadGb keepOriginals }\n    }\n": types.MeDocument,
    "\n    query Home {\n        continueWatching(limit: 12) { id title year kind { ...KindFields } durationMs progressSeconds finished spex { categoryName revival } }\n        highestRated(limit: 12) { id title year kind { ...KindFields } durationMs progressSeconds finished myRating spex { categoryName revival } }\n        recentVideos(limit: 12) { id title year kind { ...KindFields } durationMs progressSeconds finished spex { categoryName revival } }\n        categories { id name videoCount }\n        years\n    }\n": types.HomeDocument,
    "\n    query Videos($filter: VideoFilter) {\n        videos(filter: $filter) {\n            id title year kind { ...KindFields } durationMs status published progressSeconds finished\n            spex { id categoryName revival }\n        }\n        categories { id name videoCount }\n        years\n        videoKinds { ...KindFields }\n    }\n": types.VideosDocument,
    "\n    query VideoKinds {\n        videoKinds { ...KindFields position videoCount }\n    }\n": types.VideoKindsDocument,
    "\n    query Video($id: ID!) {\n        video(id: $id) {\n            id title year kind { ...KindFields } performance performanceDate description status failure durationMs width height\n            published publishedAt trashedAt originalName originalSize originalKept hasThumbnails posterSeconds\n            progressSeconds finished inWatchList myRating averageRating ratingCount createdAt lastModifiedAt\n            spex { id title year revival categoryId categoryName }\n            renditions { height width bitrateKbps copied size }\n            chapters { startSeconds title spexifyTrackId spexifyTrackTitle }\n            subtitles { language label }\n            job { id status progress attempts error createdAt startedAt finishedAt }\n        }\n    }\n": types.VideoDocument,
    "\n    query Playback($videoId: ID!) {\n        playback(videoId: $videoId) { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }\n    }\n": types.PlaybackDocument,
    "\n    query Search($q: String!) {\n        search(q: $q) { id title year kind { ...KindFields } durationMs status published progressSeconds finished spex { categoryName revival } }\n    }\n": types.SearchDocument,
    "\n    query WatchList {\n        watchList { id title year kind { ...KindFields } durationMs progressSeconds finished spex { categoryName revival } }\n    }\n": types.WatchListDocument,
    "\n    query SpexSearch($q: String!) { spexSearch(q: $q) { id title year revival categoryName } }\n": types.SpexSearchDocument,
    "\n    query SpexifyTracks($videoId: ID!) { spexifyTracks(videoId: $videoId) { id title discNumber trackNumber albumTitle } }\n": types.SpexifyTracksDocument,
    "mutation VideoKindCreate($input: VideoKindInput!) { videoKindCreate(input: $input) { id } }": types.VideoKindCreateDocument,
    "mutation VideoKindUpdate($id: ID!, $input: VideoKindInput!) { videoKindUpdate(id: $id, input: $input) { id } }": types.VideoKindUpdateDocument,
    "mutation VideoKindsReorder($ids: [ID!]!) { videoKindsReorder(ids: $ids) { id } }": types.VideoKindsReorderDocument,
    "mutation VideoKindDelete($id: ID!) { videoKindDelete(id: $id) }": types.VideoKindDeleteDocument,
    "mutation VideoCreate($input: VideoInput!) { videoCreate(input: $input) { id } }": types.VideoCreateDocument,
    "mutation VideoUpdate($id: ID!, $input: VideoInput!) { videoUpdate(id: $id, input: $input) { id } }": types.VideoUpdateDocument,
    "mutation VideoSetFile($id: ID!, $uploadId: String!) { videoSetFile(id: $id, uploadId: $uploadId) { id status } }": types.VideoSetFileDocument,
    "mutation VideoPublish($id: ID!, $published: Boolean!) { videoPublish(id: $id, published: $published) { id } }": types.VideoPublishDocument,
    "mutation VideoTrash($id: ID!) { videoTrash(id: $id) { id } }": types.VideoTrashDocument,
    "mutation VideoRestore($id: ID!) { videoRestore(id: $id) { id } }": types.VideoRestoreDocument,
    "mutation VideoDelete($id: ID!) { videoDelete(id: $id) }": types.VideoDeleteDocument,
    "mutation VideoPosterFrame($id: ID!, $seconds: Float!) { videoPosterFrame(id: $id, seconds: $seconds) { id } }": types.VideoPosterFrameDocument,
    "mutation VideoReprocess($id: ID!) { videoReprocess(id: $id) { id } }": types.VideoReprocessDocument,
    "mutation ChaptersSet($videoId: ID!, $chapters: [ChapterInput!]!) { chaptersSet(videoId: $videoId, chapters: $chapters) { id } }": types.ChaptersSetDocument,
    "mutation SubtitleRemove($videoId: ID!, $language: String!) { subtitleRemove(videoId: $videoId, language: $language) { id } }": types.SubtitleRemoveDocument,
    "mutation ProgressSave($videoId: ID!, $positionSeconds: Int!) { progressSave(videoId: $videoId, positionSeconds: $positionSeconds) }": types.ProgressSaveDocument,
    "mutation VideoRate($videoId: ID!, $rating: Int!) { videoRate(videoId: $videoId, rating: $rating) }": types.VideoRateDocument,
    "mutation WatchListAdd($videoId: ID!) { watchListAdd(videoId: $videoId) }": types.WatchListAddDocument,
    "mutation WatchListRemove($videoId: ID!) { watchListRemove(videoId: $videoId) }": types.WatchListRemoveDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Trash { trash { id title year trashedAt status } }\n"): (typeof documents)["\n    query Trash { trash { id title year trashedAt status } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Queue {\n        processingQueue { id videoId videoTitle status progress attempts error createdAt startedAt finishedAt }\n    }\n"): (typeof documents)["\n    query Queue {\n        processingQueue { id videoId videoTitle status progress attempts error createdAt startedAt finishedAt }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Storage { storage { originalsBytes renditionsBytes freeBytes videoCount } }\n"): (typeof documents)["\n    query Storage { storage { originalsBytes renditionsBytes freeBytes videoCount } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AuditLog($page: Int, $size: Int) {\n        auditLog(page: $page, size: $size) {\n            totalCount page size\n            entries { id at actorName action entityType entityId summary }\n        }\n    }\n"): (typeof documents)["\n    query AuditLog($page: Int, $size: Int) {\n        auditLog(page: $page, size: $size) {\n            totalCount page size\n            entries { id at actorName action entityType entityId summary }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Settings { settings { welcomeSv welcomeEn maxUploadGb keepOriginals } }\n"): (typeof documents)["\n    query Settings { settings { welcomeSv welcomeEn maxUploadGb keepOriginals } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation TrashEmpty { trashEmpty }"): (typeof documents)["mutation TrashEmpty { trashEmpty }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { welcomeSv } }\n"): (typeof documents)["\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { welcomeSv } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n"): (typeof documents)["\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }"): (typeof documents)["mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment KindFields on VideoKind { id nameSv nameEn isDefault }\n"): (typeof documents)["\n    fragment KindFields on VideoKind { id nameSv nameEn isDefault }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Me {\n        me { username displayName roles spexifyUser }\n        settings { welcomeSv welcomeEn maxUploadGb keepOriginals }\n    }\n"): (typeof documents)["\n    query Me {\n        me { username displayName roles spexifyUser }\n        settings { welcomeSv welcomeEn maxUploadGb keepOriginals }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Home {\n        continueWatching(limit: 12) { id title year kind { ...KindFields } durationMs progressSeconds finished spex { categoryName revival } }\n        highestRated(limit: 12) { id title year kind { ...KindFields } durationMs progressSeconds finished myRating spex { categoryName revival } }\n        recentVideos(limit: 12) { id title year kind { ...KindFields } durationMs progressSeconds finished spex { categoryName revival } }\n        categories { id name videoCount }\n        years\n    }\n"): (typeof documents)["\n    query Home {\n        continueWatching(limit: 12) { id title year kind { ...KindFields } durationMs progressSeconds finished spex { categoryName revival } }\n        highestRated(limit: 12) { id title year kind { ...KindFields } durationMs progressSeconds finished myRating spex { categoryName revival } }\n        recentVideos(limit: 12) { id title year kind { ...KindFields } durationMs progressSeconds finished spex { categoryName revival } }\n        categories { id name videoCount }\n        years\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Videos($filter: VideoFilter) {\n        videos(filter: $filter) {\n            id title year kind { ...KindFields } durationMs status published progressSeconds finished\n            spex { id categoryName revival }\n        }\n        categories { id name videoCount }\n        years\n        videoKinds { ...KindFields }\n    }\n"): (typeof documents)["\n    query Videos($filter: VideoFilter) {\n        videos(filter: $filter) {\n            id title year kind { ...KindFields } durationMs status published progressSeconds finished\n            spex { id categoryName revival }\n        }\n        categories { id name videoCount }\n        years\n        videoKinds { ...KindFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query VideoKinds {\n        videoKinds { ...KindFields position videoCount }\n    }\n"): (typeof documents)["\n    query VideoKinds {\n        videoKinds { ...KindFields position videoCount }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Video($id: ID!) {\n        video(id: $id) {\n            id title year kind { ...KindFields } performance performanceDate description status failure durationMs width height\n            published publishedAt trashedAt originalName originalSize originalKept hasThumbnails posterSeconds\n            progressSeconds finished inWatchList myRating averageRating ratingCount createdAt lastModifiedAt\n            spex { id title year revival categoryId categoryName }\n            renditions { height width bitrateKbps copied size }\n            chapters { startSeconds title spexifyTrackId spexifyTrackTitle }\n            subtitles { language label }\n            job { id status progress attempts error createdAt startedAt finishedAt }\n        }\n    }\n"): (typeof documents)["\n    query Video($id: ID!) {\n        video(id: $id) {\n            id title year kind { ...KindFields } performance performanceDate description status failure durationMs width height\n            published publishedAt trashedAt originalName originalSize originalKept hasThumbnails posterSeconds\n            progressSeconds finished inWatchList myRating averageRating ratingCount createdAt lastModifiedAt\n            spex { id title year revival categoryId categoryName }\n            renditions { height width bitrateKbps copied size }\n            chapters { startSeconds title spexifyTrackId spexifyTrackTitle }\n            subtitles { language label }\n            job { id status progress attempts error createdAt startedAt finishedAt }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Playback($videoId: ID!) {\n        playback(videoId: $videoId) { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }\n    }\n"): (typeof documents)["\n    query Playback($videoId: ID!) {\n        playback(videoId: $videoId) { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Search($q: String!) {\n        search(q: $q) { id title year kind { ...KindFields } durationMs status published progressSeconds finished spex { categoryName revival } }\n    }\n"): (typeof documents)["\n    query Search($q: String!) {\n        search(q: $q) { id title year kind { ...KindFields } durationMs status published progressSeconds finished spex { categoryName revival } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query WatchList {\n        watchList { id title year kind { ...KindFields } durationMs progressSeconds finished spex { categoryName revival } }\n    }\n"): (typeof documents)["\n    query WatchList {\n        watchList { id title year kind { ...KindFields } durationMs progressSeconds finished spex { categoryName revival } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SpexSearch($q: String!) { spexSearch(q: $q) { id title year revival categoryName } }\n"): (typeof documents)["\n    query SpexSearch($q: String!) { spexSearch(q: $q) { id title year revival categoryName } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SpexifyTracks($videoId: ID!) { spexifyTracks(videoId: $videoId) { id title discNumber trackNumber albumTitle } }\n"): (typeof documents)["\n    query SpexifyTracks($videoId: ID!) { spexifyTracks(videoId: $videoId) { id title discNumber trackNumber albumTitle } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoKindCreate($input: VideoKindInput!) { videoKindCreate(input: $input) { id } }"): (typeof documents)["mutation VideoKindCreate($input: VideoKindInput!) { videoKindCreate(input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoKindUpdate($id: ID!, $input: VideoKindInput!) { videoKindUpdate(id: $id, input: $input) { id } }"): (typeof documents)["mutation VideoKindUpdate($id: ID!, $input: VideoKindInput!) { videoKindUpdate(id: $id, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoKindsReorder($ids: [ID!]!) { videoKindsReorder(ids: $ids) { id } }"): (typeof documents)["mutation VideoKindsReorder($ids: [ID!]!) { videoKindsReorder(ids: $ids) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoKindDelete($id: ID!) { videoKindDelete(id: $id) }"): (typeof documents)["mutation VideoKindDelete($id: ID!) { videoKindDelete(id: $id) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoCreate($input: VideoInput!) { videoCreate(input: $input) { id } }"): (typeof documents)["mutation VideoCreate($input: VideoInput!) { videoCreate(input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoUpdate($id: ID!, $input: VideoInput!) { videoUpdate(id: $id, input: $input) { id } }"): (typeof documents)["mutation VideoUpdate($id: ID!, $input: VideoInput!) { videoUpdate(id: $id, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoSetFile($id: ID!, $uploadId: String!) { videoSetFile(id: $id, uploadId: $uploadId) { id status } }"): (typeof documents)["mutation VideoSetFile($id: ID!, $uploadId: String!) { videoSetFile(id: $id, uploadId: $uploadId) { id status } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoPublish($id: ID!, $published: Boolean!) { videoPublish(id: $id, published: $published) { id } }"): (typeof documents)["mutation VideoPublish($id: ID!, $published: Boolean!) { videoPublish(id: $id, published: $published) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoTrash($id: ID!) { videoTrash(id: $id) { id } }"): (typeof documents)["mutation VideoTrash($id: ID!) { videoTrash(id: $id) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoRestore($id: ID!) { videoRestore(id: $id) { id } }"): (typeof documents)["mutation VideoRestore($id: ID!) { videoRestore(id: $id) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoDelete($id: ID!) { videoDelete(id: $id) }"): (typeof documents)["mutation VideoDelete($id: ID!) { videoDelete(id: $id) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoPosterFrame($id: ID!, $seconds: Float!) { videoPosterFrame(id: $id, seconds: $seconds) { id } }"): (typeof documents)["mutation VideoPosterFrame($id: ID!, $seconds: Float!) { videoPosterFrame(id: $id, seconds: $seconds) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoReprocess($id: ID!) { videoReprocess(id: $id) { id } }"): (typeof documents)["mutation VideoReprocess($id: ID!) { videoReprocess(id: $id) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ChaptersSet($videoId: ID!, $chapters: [ChapterInput!]!) { chaptersSet(videoId: $videoId, chapters: $chapters) { id } }"): (typeof documents)["mutation ChaptersSet($videoId: ID!, $chapters: [ChapterInput!]!) { chaptersSet(videoId: $videoId, chapters: $chapters) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SubtitleRemove($videoId: ID!, $language: String!) { subtitleRemove(videoId: $videoId, language: $language) { id } }"): (typeof documents)["mutation SubtitleRemove($videoId: ID!, $language: String!) { subtitleRemove(videoId: $videoId, language: $language) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ProgressSave($videoId: ID!, $positionSeconds: Int!) { progressSave(videoId: $videoId, positionSeconds: $positionSeconds) }"): (typeof documents)["mutation ProgressSave($videoId: ID!, $positionSeconds: Int!) { progressSave(videoId: $videoId, positionSeconds: $positionSeconds) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoRate($videoId: ID!, $rating: Int!) { videoRate(videoId: $videoId, rating: $rating) }"): (typeof documents)["mutation VideoRate($videoId: ID!, $rating: Int!) { videoRate(videoId: $videoId, rating: $rating) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation WatchListAdd($videoId: ID!) { watchListAdd(videoId: $videoId) }"): (typeof documents)["mutation WatchListAdd($videoId: ID!) { watchListAdd(videoId: $videoId) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation WatchListRemove($videoId: ID!) { watchListRemove(videoId: $videoId) }"): (typeof documents)["mutation WatchListRemove($videoId: ID!) { watchListRemove(videoId: $videoId) }"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;