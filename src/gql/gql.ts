/* eslint-disable */
import * as types from "./graphql";
import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

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
  "\n    query AuditLog($page: Int, $size: Int, $filter: AuditFilter) {\n        auditLog(page: $page, size: $size, filter: $filter) {\n            totalCount page size\n            entries { id at actorId actorName action entityType entityId summary }\n        }\n    }\n": typeof types.AuditLogDocument,
  "\n    query AuditActors { auditActors { id name } }\n": typeof types.AuditActorsDocument,
  "\n    query Settings { settings { welcomeSv welcomeEn maxUploadGb keepOriginals } }\n": typeof types.SettingsDocument,
  "mutation TrashEmpty { trashEmpty }": typeof types.TrashEmptyDocument,
  "\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { welcomeSv } }\n": typeof types.SettingsUpdateDocument,
  "\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n": typeof types.MaintenanceJobsDocument,
  "mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }": typeof types.MaintenanceJobRunDocument,
  "\n    fragment KindFields on VideoKind { id nameSv nameEn isDefault }\n": typeof types.KindFieldsFragmentDoc,
  "\n    fragment VideoCardFields on Video {\n        id title year kind { ...KindFields } durationMs status published progressSeconds finished averageRating ratingCount liked\n        spex { id title familyId categoryName revival }\n    }\n": typeof types.VideoCardFieldsFragmentDoc,
  "\n    query Me {\n        me { username displayName roles spexifyUser }\n        settings { welcomeSv welcomeEn maxUploadGb keepOriginals }\n    }\n": typeof types.MeDocument,
  "\n    query Home {\n        continueWatching(limit: 12) { ...VideoCardFields }\n        highestRated(limit: 12) { ...VideoCardFields myRating }\n        recentVideos(limit: 12) { ...VideoCardFields }\n        topVideos(by: RATED, limit: 6) { ...VideoCardFields }\n        likedVideos { ...VideoCardFields }\n        categories { id name videoCount }\n        years\n    }\n": typeof types.HomeDocument,
  "\n    query Videos($filter: VideoFilter) {\n        videos(filter: $filter) {\n            ...VideoCardFields\n        }\n        categories { id name videoCount }\n        years\n        videoKinds { ...KindFields }\n    }\n": typeof types.VideosDocument,
  "\n    query VideoKinds {\n        videoKinds { ...KindFields position videoCount }\n    }\n": typeof types.VideoKindsDocument,
  "\n    query Video($id: ID!) {\n        video(id: $id) {\n            id title year kind { ...KindFields } performance performanceDate description status failure durationMs width height\n            published publishedAt trashedAt originalName originalSize originalKept hasThumbnails posterSeconds\n            progressSeconds finished inWatchList liked likeCount myRating averageRating ratingCount createdAt lastModifiedAt\n            spex { id title year revival parentId familyId categoryId categoryName }\n            renditions { height width bitrateKbps copied size }\n            chapters { startSeconds title spexifyTrackId spexifyTrackTitle }\n            subtitles { language label }\n            job { id status progress attempts error createdAt startedAt finishedAt }\n            collections { id title }\n            next { id title year kind { ...KindFields } durationMs }\n        }\n    }\n": typeof types.VideoDocument,
  "\n    query Collections {\n        collections {\n            id title description createdAt lastModifiedAt\n            videos { ...VideoCardFields }\n        }\n    }\n": typeof types.CollectionsDocument,
  "\n    query Collection($id: ID!) {\n        collection(id: $id) {\n            id title description createdAt lastModifiedAt\n            videos { ...VideoCardFields }\n        }\n    }\n": typeof types.CollectionDocument,
  "\n    query Playback($videoId: ID!) {\n        playback(videoId: $videoId) { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }\n    }\n": typeof types.PlaybackDocument,
  "\n    query Search($q: String!) {\n        search(q: $q) { ...VideoCardFields }\n    }\n": typeof types.SearchDocument,
  "\n    query WatchList {\n        watchList { ...VideoCardFields }\n    }\n": typeof types.WatchListDocument,
  "\n    query Liked {\n        likedVideos { ...VideoCardFields }\n    }\n": typeof types.LikedDocument,
  "\n    query Top($by: TopBy!, $filter: VideoFilter, $limit: Int) {\n        topVideos(by: $by, filter: $filter, limit: $limit) { ...VideoCardFields likeCount }\n        categories { id name videoCount }\n        years\n    }\n": typeof types.TopDocument,
  "\n    query Playlists {\n        playlists { id name description isPublic owned ownerName itemCount durationSeconds updatedAt items { id video { id } } }\n    }\n": typeof types.PlaylistsDocument,
  "\n    query Playlist($id: ID!) {\n        playlist(id: $id) {\n            id name description isPublic owned ownerName itemCount durationSeconds createdAt updatedAt\n            items { id startSeconds endSeconds title durationSeconds video { ...VideoCardFields } }\n        }\n    }\n": typeof types.PlaylistDocument,
  "\n    fragment PlaylistFields on Playlist { id name itemCount }\n": typeof types.PlaylistFieldsFragmentDoc,
  "\n    query SpexSearch($q: String!) { spexSearch(q: $q) { id title year revival parentId categoryName } }\n": typeof types.SpexSearchDocument,
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
  "mutation ProgressClear($videoId: ID!) { progressClear(videoId: $videoId) }": typeof types.ProgressClearDocument,
  "mutation VideoMarkWatched($videoId: ID!) { videoMarkWatched(videoId: $videoId) }": typeof types.VideoMarkWatchedDocument,
  "mutation VideoLike($videoId: ID!, $liked: Boolean!) { videoLike(videoId: $videoId, liked: $liked) }": typeof types.VideoLikeDocument,
  "mutation PlaylistCreate($input: PlaylistInput!) { playlistCreate(input: $input) { ...PlaylistFields } }": typeof types.PlaylistCreateDocument,
  "mutation PlaylistUpdate($id: ID!, $input: PlaylistInput!) { playlistUpdate(id: $id, input: $input) { ...PlaylistFields } }": typeof types.PlaylistUpdateDocument,
  "mutation PlaylistDelete($id: ID!) { playlistDelete(id: $id) }": typeof types.PlaylistDeleteDocument,
  "mutation PlaylistAddItem($playlistId: ID!, $videoId: ID!, $startSeconds: Int) { playlistAddItem(playlistId: $playlistId, videoId: $videoId, startSeconds: $startSeconds) { ...PlaylistFields } }": typeof types.PlaylistAddItemDocument,
  "mutation PlaylistRemoveItem($playlistId: ID!, $itemId: ID!) { playlistRemoveItem(playlistId: $playlistId, itemId: $itemId) { ...PlaylistFields } }": typeof types.PlaylistRemoveItemDocument,
  "mutation PlaylistReorder($playlistId: ID!, $itemIds: [ID!]!) { playlistReorder(playlistId: $playlistId, itemIds: $itemIds) { ...PlaylistFields } }": typeof types.PlaylistReorderDocument,
  "mutation CollectionCreate($input: CollectionInput!) { collectionCreate(input: $input) { id } }": typeof types.CollectionCreateDocument,
  "mutation CollectionUpdate($id: ID!, $input: CollectionInput!) { collectionUpdate(id: $id, input: $input) { id } }": typeof types.CollectionUpdateDocument,
  "mutation CollectionDelete($id: ID!) { collectionDelete(id: $id) }": typeof types.CollectionDeleteDocument,
};
const documents: Documents = {
  "\n    query Trash { trash { id title year trashedAt status } }\n": types.TrashDocument,
  "\n    query Queue {\n        processingQueue { id videoId videoTitle status progress attempts error createdAt startedAt finishedAt }\n    }\n": types.QueueDocument,
  "\n    query Storage { storage { originalsBytes renditionsBytes freeBytes videoCount } }\n": types.StorageDocument,
  "\n    query AuditLog($page: Int, $size: Int, $filter: AuditFilter) {\n        auditLog(page: $page, size: $size, filter: $filter) {\n            totalCount page size\n            entries { id at actorId actorName action entityType entityId summary }\n        }\n    }\n": types.AuditLogDocument,
  "\n    query AuditActors { auditActors { id name } }\n": types.AuditActorsDocument,
  "\n    query Settings { settings { welcomeSv welcomeEn maxUploadGb keepOriginals } }\n": types.SettingsDocument,
  "mutation TrashEmpty { trashEmpty }": types.TrashEmptyDocument,
  "\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { welcomeSv } }\n": types.SettingsUpdateDocument,
  "\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n": types.MaintenanceJobsDocument,
  "mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }": types.MaintenanceJobRunDocument,
  "\n    fragment KindFields on VideoKind { id nameSv nameEn isDefault }\n": types.KindFieldsFragmentDoc,
  "\n    fragment VideoCardFields on Video {\n        id title year kind { ...KindFields } durationMs status published progressSeconds finished averageRating ratingCount liked\n        spex { id title familyId categoryName revival }\n    }\n": types.VideoCardFieldsFragmentDoc,
  "\n    query Me {\n        me { username displayName roles spexifyUser }\n        settings { welcomeSv welcomeEn maxUploadGb keepOriginals }\n    }\n": types.MeDocument,
  "\n    query Home {\n        continueWatching(limit: 12) { ...VideoCardFields }\n        highestRated(limit: 12) { ...VideoCardFields myRating }\n        recentVideos(limit: 12) { ...VideoCardFields }\n        topVideos(by: RATED, limit: 6) { ...VideoCardFields }\n        likedVideos { ...VideoCardFields }\n        categories { id name videoCount }\n        years\n    }\n": types.HomeDocument,
  "\n    query Videos($filter: VideoFilter) {\n        videos(filter: $filter) {\n            ...VideoCardFields\n        }\n        categories { id name videoCount }\n        years\n        videoKinds { ...KindFields }\n    }\n": types.VideosDocument,
  "\n    query VideoKinds {\n        videoKinds { ...KindFields position videoCount }\n    }\n": types.VideoKindsDocument,
  "\n    query Video($id: ID!) {\n        video(id: $id) {\n            id title year kind { ...KindFields } performance performanceDate description status failure durationMs width height\n            published publishedAt trashedAt originalName originalSize originalKept hasThumbnails posterSeconds\n            progressSeconds finished inWatchList liked likeCount myRating averageRating ratingCount createdAt lastModifiedAt\n            spex { id title year revival parentId familyId categoryId categoryName }\n            renditions { height width bitrateKbps copied size }\n            chapters { startSeconds title spexifyTrackId spexifyTrackTitle }\n            subtitles { language label }\n            job { id status progress attempts error createdAt startedAt finishedAt }\n            collections { id title }\n            next { id title year kind { ...KindFields } durationMs }\n        }\n    }\n": types.VideoDocument,
  "\n    query Collections {\n        collections {\n            id title description createdAt lastModifiedAt\n            videos { ...VideoCardFields }\n        }\n    }\n": types.CollectionsDocument,
  "\n    query Collection($id: ID!) {\n        collection(id: $id) {\n            id title description createdAt lastModifiedAt\n            videos { ...VideoCardFields }\n        }\n    }\n": types.CollectionDocument,
  "\n    query Playback($videoId: ID!) {\n        playback(videoId: $videoId) { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }\n    }\n": types.PlaybackDocument,
  "\n    query Search($q: String!) {\n        search(q: $q) { ...VideoCardFields }\n    }\n": types.SearchDocument,
  "\n    query WatchList {\n        watchList { ...VideoCardFields }\n    }\n": types.WatchListDocument,
  "\n    query Liked {\n        likedVideos { ...VideoCardFields }\n    }\n": types.LikedDocument,
  "\n    query Top($by: TopBy!, $filter: VideoFilter, $limit: Int) {\n        topVideos(by: $by, filter: $filter, limit: $limit) { ...VideoCardFields likeCount }\n        categories { id name videoCount }\n        years\n    }\n": types.TopDocument,
  "\n    query Playlists {\n        playlists { id name description isPublic owned ownerName itemCount durationSeconds updatedAt items { id video { id } } }\n    }\n": types.PlaylistsDocument,
  "\n    query Playlist($id: ID!) {\n        playlist(id: $id) {\n            id name description isPublic owned ownerName itemCount durationSeconds createdAt updatedAt\n            items { id startSeconds endSeconds title durationSeconds video { ...VideoCardFields } }\n        }\n    }\n": types.PlaylistDocument,
  "\n    fragment PlaylistFields on Playlist { id name itemCount }\n": types.PlaylistFieldsFragmentDoc,
  "\n    query SpexSearch($q: String!) { spexSearch(q: $q) { id title year revival parentId categoryName } }\n": types.SpexSearchDocument,
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
  "mutation ProgressClear($videoId: ID!) { progressClear(videoId: $videoId) }": types.ProgressClearDocument,
  "mutation VideoMarkWatched($videoId: ID!) { videoMarkWatched(videoId: $videoId) }": types.VideoMarkWatchedDocument,
  "mutation VideoLike($videoId: ID!, $liked: Boolean!) { videoLike(videoId: $videoId, liked: $liked) }": types.VideoLikeDocument,
  "mutation PlaylistCreate($input: PlaylistInput!) { playlistCreate(input: $input) { ...PlaylistFields } }": types.PlaylistCreateDocument,
  "mutation PlaylistUpdate($id: ID!, $input: PlaylistInput!) { playlistUpdate(id: $id, input: $input) { ...PlaylistFields } }": types.PlaylistUpdateDocument,
  "mutation PlaylistDelete($id: ID!) { playlistDelete(id: $id) }": types.PlaylistDeleteDocument,
  "mutation PlaylistAddItem($playlistId: ID!, $videoId: ID!, $startSeconds: Int) { playlistAddItem(playlistId: $playlistId, videoId: $videoId, startSeconds: $startSeconds) { ...PlaylistFields } }": types.PlaylistAddItemDocument,
  "mutation PlaylistRemoveItem($playlistId: ID!, $itemId: ID!) { playlistRemoveItem(playlistId: $playlistId, itemId: $itemId) { ...PlaylistFields } }": types.PlaylistRemoveItemDocument,
  "mutation PlaylistReorder($playlistId: ID!, $itemIds: [ID!]!) { playlistReorder(playlistId: $playlistId, itemIds: $itemIds) { ...PlaylistFields } }": types.PlaylistReorderDocument,
  "mutation CollectionCreate($input: CollectionInput!) { collectionCreate(input: $input) { id } }": types.CollectionCreateDocument,
  "mutation CollectionUpdate($id: ID!, $input: CollectionInput!) { collectionUpdate(id: $id, input: $input) { id } }": types.CollectionUpdateDocument,
  "mutation CollectionDelete($id: ID!) { collectionDelete(id: $id) }": types.CollectionDeleteDocument,
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
export function graphql(source: "\n    query AuditLog($page: Int, $size: Int, $filter: AuditFilter) {\n        auditLog(page: $page, size: $size, filter: $filter) {\n            totalCount page size\n            entries { id at actorId actorName action entityType entityId summary }\n        }\n    }\n"): (typeof documents)["\n    query AuditLog($page: Int, $size: Int, $filter: AuditFilter) {\n        auditLog(page: $page, size: $size, filter: $filter) {\n            totalCount page size\n            entries { id at actorId actorName action entityType entityId summary }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AuditActors { auditActors { id name } }\n"): (typeof documents)["\n    query AuditActors { auditActors { id name } }\n"];
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
export function graphql(source: "\n    fragment VideoCardFields on Video {\n        id title year kind { ...KindFields } durationMs status published progressSeconds finished averageRating ratingCount liked\n        spex { id title familyId categoryName revival }\n    }\n"): (typeof documents)["\n    fragment VideoCardFields on Video {\n        id title year kind { ...KindFields } durationMs status published progressSeconds finished averageRating ratingCount liked\n        spex { id title familyId categoryName revival }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Me {\n        me { username displayName roles spexifyUser }\n        settings { welcomeSv welcomeEn maxUploadGb keepOriginals }\n    }\n"): (typeof documents)["\n    query Me {\n        me { username displayName roles spexifyUser }\n        settings { welcomeSv welcomeEn maxUploadGb keepOriginals }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Home {\n        continueWatching(limit: 12) { ...VideoCardFields }\n        highestRated(limit: 12) { ...VideoCardFields myRating }\n        recentVideos(limit: 12) { ...VideoCardFields }\n        topVideos(by: RATED, limit: 6) { ...VideoCardFields }\n        likedVideos { ...VideoCardFields }\n        categories { id name videoCount }\n        years\n    }\n"): (typeof documents)["\n    query Home {\n        continueWatching(limit: 12) { ...VideoCardFields }\n        highestRated(limit: 12) { ...VideoCardFields myRating }\n        recentVideos(limit: 12) { ...VideoCardFields }\n        topVideos(by: RATED, limit: 6) { ...VideoCardFields }\n        likedVideos { ...VideoCardFields }\n        categories { id name videoCount }\n        years\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Videos($filter: VideoFilter) {\n        videos(filter: $filter) {\n            ...VideoCardFields\n        }\n        categories { id name videoCount }\n        years\n        videoKinds { ...KindFields }\n    }\n"): (typeof documents)["\n    query Videos($filter: VideoFilter) {\n        videos(filter: $filter) {\n            ...VideoCardFields\n        }\n        categories { id name videoCount }\n        years\n        videoKinds { ...KindFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query VideoKinds {\n        videoKinds { ...KindFields position videoCount }\n    }\n"): (typeof documents)["\n    query VideoKinds {\n        videoKinds { ...KindFields position videoCount }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Video($id: ID!) {\n        video(id: $id) {\n            id title year kind { ...KindFields } performance performanceDate description status failure durationMs width height\n            published publishedAt trashedAt originalName originalSize originalKept hasThumbnails posterSeconds\n            progressSeconds finished inWatchList liked likeCount myRating averageRating ratingCount createdAt lastModifiedAt\n            spex { id title year revival parentId familyId categoryId categoryName }\n            renditions { height width bitrateKbps copied size }\n            chapters { startSeconds title spexifyTrackId spexifyTrackTitle }\n            subtitles { language label }\n            job { id status progress attempts error createdAt startedAt finishedAt }\n            collections { id title }\n            next { id title year kind { ...KindFields } durationMs }\n        }\n    }\n"): (typeof documents)["\n    query Video($id: ID!) {\n        video(id: $id) {\n            id title year kind { ...KindFields } performance performanceDate description status failure durationMs width height\n            published publishedAt trashedAt originalName originalSize originalKept hasThumbnails posterSeconds\n            progressSeconds finished inWatchList liked likeCount myRating averageRating ratingCount createdAt lastModifiedAt\n            spex { id title year revival parentId familyId categoryId categoryName }\n            renditions { height width bitrateKbps copied size }\n            chapters { startSeconds title spexifyTrackId spexifyTrackTitle }\n            subtitles { language label }\n            job { id status progress attempts error createdAt startedAt finishedAt }\n            collections { id title }\n            next { id title year kind { ...KindFields } durationMs }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Collections {\n        collections {\n            id title description createdAt lastModifiedAt\n            videos { ...VideoCardFields }\n        }\n    }\n"): (typeof documents)["\n    query Collections {\n        collections {\n            id title description createdAt lastModifiedAt\n            videos { ...VideoCardFields }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Collection($id: ID!) {\n        collection(id: $id) {\n            id title description createdAt lastModifiedAt\n            videos { ...VideoCardFields }\n        }\n    }\n"): (typeof documents)["\n    query Collection($id: ID!) {\n        collection(id: $id) {\n            id title description createdAt lastModifiedAt\n            videos { ...VideoCardFields }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Playback($videoId: ID!) {\n        playback(videoId: $videoId) { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }\n    }\n"): (typeof documents)["\n    query Playback($videoId: ID!) {\n        playback(videoId: $videoId) { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Search($q: String!) {\n        search(q: $q) { ...VideoCardFields }\n    }\n"): (typeof documents)["\n    query Search($q: String!) {\n        search(q: $q) { ...VideoCardFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query WatchList {\n        watchList { ...VideoCardFields }\n    }\n"): (typeof documents)["\n    query WatchList {\n        watchList { ...VideoCardFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Liked {\n        likedVideos { ...VideoCardFields }\n    }\n"): (typeof documents)["\n    query Liked {\n        likedVideos { ...VideoCardFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Top($by: TopBy!, $filter: VideoFilter, $limit: Int) {\n        topVideos(by: $by, filter: $filter, limit: $limit) { ...VideoCardFields likeCount }\n        categories { id name videoCount }\n        years\n    }\n"): (typeof documents)["\n    query Top($by: TopBy!, $filter: VideoFilter, $limit: Int) {\n        topVideos(by: $by, filter: $filter, limit: $limit) { ...VideoCardFields likeCount }\n        categories { id name videoCount }\n        years\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Playlists {\n        playlists { id name description isPublic owned ownerName itemCount durationSeconds updatedAt items { id video { id } } }\n    }\n"): (typeof documents)["\n    query Playlists {\n        playlists { id name description isPublic owned ownerName itemCount durationSeconds updatedAt items { id video { id } } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Playlist($id: ID!) {\n        playlist(id: $id) {\n            id name description isPublic owned ownerName itemCount durationSeconds createdAt updatedAt\n            items { id startSeconds endSeconds title durationSeconds video { ...VideoCardFields } }\n        }\n    }\n"): (typeof documents)["\n    query Playlist($id: ID!) {\n        playlist(id: $id) {\n            id name description isPublic owned ownerName itemCount durationSeconds createdAt updatedAt\n            items { id startSeconds endSeconds title durationSeconds video { ...VideoCardFields } }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment PlaylistFields on Playlist { id name itemCount }\n"): (typeof documents)["\n    fragment PlaylistFields on Playlist { id name itemCount }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SpexSearch($q: String!) { spexSearch(q: $q) { id title year revival parentId categoryName } }\n"): (typeof documents)["\n    query SpexSearch($q: String!) { spexSearch(q: $q) { id title year revival parentId categoryName } }\n"];
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
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ProgressClear($videoId: ID!) { progressClear(videoId: $videoId) }"): (typeof documents)["mutation ProgressClear($videoId: ID!) { progressClear(videoId: $videoId) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoMarkWatched($videoId: ID!) { videoMarkWatched(videoId: $videoId) }"): (typeof documents)["mutation VideoMarkWatched($videoId: ID!) { videoMarkWatched(videoId: $videoId) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation VideoLike($videoId: ID!, $liked: Boolean!) { videoLike(videoId: $videoId, liked: $liked) }"): (typeof documents)["mutation VideoLike($videoId: ID!, $liked: Boolean!) { videoLike(videoId: $videoId, liked: $liked) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation PlaylistCreate($input: PlaylistInput!) { playlistCreate(input: $input) { ...PlaylistFields } }"): (typeof documents)["mutation PlaylistCreate($input: PlaylistInput!) { playlistCreate(input: $input) { ...PlaylistFields } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation PlaylistUpdate($id: ID!, $input: PlaylistInput!) { playlistUpdate(id: $id, input: $input) { ...PlaylistFields } }"): (typeof documents)["mutation PlaylistUpdate($id: ID!, $input: PlaylistInput!) { playlistUpdate(id: $id, input: $input) { ...PlaylistFields } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation PlaylistDelete($id: ID!) { playlistDelete(id: $id) }"): (typeof documents)["mutation PlaylistDelete($id: ID!) { playlistDelete(id: $id) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation PlaylistAddItem($playlistId: ID!, $videoId: ID!, $startSeconds: Int) { playlistAddItem(playlistId: $playlistId, videoId: $videoId, startSeconds: $startSeconds) { ...PlaylistFields } }"): (typeof documents)["mutation PlaylistAddItem($playlistId: ID!, $videoId: ID!, $startSeconds: Int) { playlistAddItem(playlistId: $playlistId, videoId: $videoId, startSeconds: $startSeconds) { ...PlaylistFields } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation PlaylistRemoveItem($playlistId: ID!, $itemId: ID!) { playlistRemoveItem(playlistId: $playlistId, itemId: $itemId) { ...PlaylistFields } }"): (typeof documents)["mutation PlaylistRemoveItem($playlistId: ID!, $itemId: ID!) { playlistRemoveItem(playlistId: $playlistId, itemId: $itemId) { ...PlaylistFields } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation PlaylistReorder($playlistId: ID!, $itemIds: [ID!]!) { playlistReorder(playlistId: $playlistId, itemIds: $itemIds) { ...PlaylistFields } }"): (typeof documents)["mutation PlaylistReorder($playlistId: ID!, $itemIds: [ID!]!) { playlistReorder(playlistId: $playlistId, itemIds: $itemIds) { ...PlaylistFields } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CollectionCreate($input: CollectionInput!) { collectionCreate(input: $input) { id } }"): (typeof documents)["mutation CollectionCreate($input: CollectionInput!) { collectionCreate(input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CollectionUpdate($id: ID!, $input: CollectionInput!) { collectionUpdate(id: $id, input: $input) { id } }"): (typeof documents)["mutation CollectionUpdate($id: ID!, $input: CollectionInput!) { collectionUpdate(id: $id, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CollectionDelete($id: ID!) { collectionDelete(id: $id) }"): (typeof documents)["mutation CollectionDelete($id: ID!) { collectionDelete(id: $id) }"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;