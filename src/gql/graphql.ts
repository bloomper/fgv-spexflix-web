/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/** What to show of the audit log; every field is optional. */
export type AuditFilter = {
  /** CREATE, UPDATE, DELETE and so on. */
  action?: string | null | undefined;
  /** Who made the change; only ADMIN sees others' changes. */
  actorId?: string | null | undefined;
  /** One record's changes. */
  entityId?: string | number | null | undefined;
  /** What was changed, e.g. ALBUM or VIDEO. */
  entityType?: string | null | undefined;
  /** Changes from this instant on. */
  from?: string | null | undefined;
  /** Text the summary contains. */
  q?: string | null | undefined;
  /** Changes before this instant. */
  to?: string | null | undefined;
};

export type ChapterInput = {
  /** A track in Spexify, from spexifyTracks. */
  spexifyTrackId?: string | number | null | undefined;
  spexifyTrackTitle?: string | null | undefined;
  startSeconds: number;
  title: string;
};

export type CollectionInput = {
  description?: string | null | undefined;
  title: string;
  videoIds: Array<string | number>;
};

/**
 * A scheduled maintenance job: copying the current spex data from Spexregister (SPEX_REFRESH), and removing uploads that
 * were never used (UPLOAD_CLEANUP).
 */
export type MaintenanceJob =
  | "SPEX_REFRESH"
  | "UPLOAD_CLEANUP";

export type PlaylistInput = {
  description?: string | null | undefined;
  isPublic?: boolean | null | undefined;
  name: string;
};

export type SettingsInput = {
  keepOriginals: boolean;
  maxUploadGb: number;
  welcomeEn?: string | null | undefined;
  welcomeSv?: string | null | undefined;
};

/** What a top list ranks by. */
export type TopBy =
/** How many like the video. */
  | "LIKED"
  /** Everyone's ratings, as an average weighed against two votes of the mean of all ratings, so that one 5 does not top the list. */
  | "RATED"
  /** How many have watched it to the end. */
  | "WATCHED";

export type VideoFilter = {
  /** The main spex's category. */
  categoryId?: string | number | null | undefined;
  /** Videos from this year on. */
  fromYear?: number | null | undefined;
  /** EDITOR only. */
  includeUnpublished?: boolean | null | undefined;
  kindId?: string | number | null | undefined;
  /** Only videos the caller likes. */
  liked?: boolean | null | undefined;
  sort?: VideoSort | null | undefined;
  /** Videos about the spex or, when it is an original, one of its revivals. */
  spexId?: string | number | null | undefined;
  /** Videos up to and including this year. */
  toYear?: number | null | undefined;
  /** Only videos the caller has not watched to the end. */
  unwatched?: boolean | null | undefined;
  year?: number | null | undefined;
};

export type VideoInput = {
  description?: string | null | undefined;
  /** A video kind; defaults to the first one for a new video and to the current one for an existing video. */
  kindId?: string | number | null | undefined;
  /** e.g. Premiere */
  performance?: string | null | undefined;
  /** yyyy-mm-dd */
  performanceDate?: string | null | undefined;
  /** Spex in Spexregister, the main one first, e.g. several for a jubilee show. Empty when the video is not about any spex. */
  spexIds?: Array<string | number>;
  /** Defaults to the main spex's title; required without a spex. */
  title?: string | null | undefined;
  /** Defaults to the main spex's year. */
  year?: number | null | undefined;
};

export type VideoKindInput = {
  nameEn: string;
  nameSv: string;
};

/** How to order videos. Ties keep the default order: newest year first, then title. */
export type VideoSort =
/** Most liked first. */
  | "LIKES"
  /** Most recently published first. */
  | "PUBLISHED"
  /** Highest weighted average rating first; unrated videos last. */
  | "RATING"
  | "TITLE"
  | "YEAR_ASC"
  /** Newest year first; the default. */
  | "YEAR_DESC";

export type VideoStatus =
  | "FAILED"
  | "PROCESSING"
  | "READY"
  | "UPLOADING";

export type TrashQueryVariables = Exact<{ [key: string]: never; }>;


export type TrashQuery = {
  trash: Array<{ id: string, title: string, year: number | null, trashedAt: string | null, status: VideoStatus }>
};

export type QueueQueryVariables = Exact<{ [key: string]: never; }>;


export type QueueQuery = {
  processingQueue: Array<{
    id: string,
    videoId: string,
    videoTitle: string,
    status: string,
    progress: number,
    attempts: number,
    error: string | null,
    createdAt: string,
    startedAt: string | null,
    finishedAt: string | null
  }>
};

export type StorageQueryVariables = Exact<{ [key: string]: never; }>;


export type StorageQuery = {
  storage: { originalsBytes: number, renditionsBytes: number, freeBytes: number, videoCount: number }
};

export type AuditLogQueryVariables = Exact<{
  page?: number | null | undefined;
  size?: number | null | undefined;
  filter?: AuditFilter | null | undefined;
}>;


export type AuditLogQuery = {
  auditLog: {
    totalCount: number,
    page: number,
    size: number,
    entries: Array<{
      id: string,
      at: string,
      actorId: string,
      actorName: string | null,
      action: string,
      entityType: string,
      entityId: string | null,
      summary: string
    }>
  }
};

export type AuditActorsQueryVariables = Exact<{ [key: string]: never; }>;


export type AuditActorsQuery = { auditActors: Array<{ id: string, name: string | null }> };

export type SettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SettingsQuery = {
  settings: { welcomeSv: string | null, welcomeEn: string | null, maxUploadGb: number, keepOriginals: boolean }
};

export type TrashEmptyMutationVariables = Exact<{ [key: string]: never; }>;


export type TrashEmptyMutation = { trashEmpty: null | null };

export type SettingsUpdateMutationVariables = Exact<{
  input: SettingsInput;
}>;


export type SettingsUpdateMutation = { settingsUpdate: { welcomeSv: string | null } };

export type MaintenanceJobsQueryVariables = Exact<{ [key: string]: never; }>;


export type MaintenanceJobsQuery = {
  maintenanceJobs: Array<{
    job: MaintenanceJob,
    schedule: string | null,
    running: boolean,
    lastStartedAt: string | null,
    lastFinishedAt: string | null,
    lastSucceeded: boolean | null
  }>
};

export type MaintenanceJobRunMutationVariables = Exact<{
  job: MaintenanceJob;
}>;


export type MaintenanceJobRunMutation = { maintenanceJobRun: boolean };

export type KindFieldsFragment = { id: string, nameSv: string, nameEn: string, isDefault: boolean };

export type VideoCardFieldsFragment = {
  id: string,
  title: string,
  year: number | null,
  durationMs: number | null,
  status: VideoStatus,
  published: boolean,
  progressSeconds: number | null,
  finished: boolean,
  averageRating: number | null,
  ratingCount: number,
  liked: boolean,
  kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
  spex: Array<{
    id: string,
    title: string | null,
    familyId: string,
    categoryName: string | null,
    revival: boolean | null
  }>
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = {
  me: { username: string, displayName: string | null, roles: Array<string>, spexifyUser: boolean },
  settings: { welcomeSv: string | null, welcomeEn: string | null, maxUploadGb: number, keepOriginals: boolean }
};

export type HomeQueryVariables = Exact<{ [key: string]: never; }>;


export type HomeQuery = {
  years: Array<number>,
  continueWatching: Array<{
    id: string,
    title: string,
    year: number | null,
    durationMs: number | null,
    status: VideoStatus,
    published: boolean,
    progressSeconds: number | null,
    finished: boolean,
    averageRating: number | null,
    ratingCount: number,
    liked: boolean,
    kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
    spex: Array<{
      id: string,
      title: string | null,
      familyId: string,
      categoryName: string | null,
      revival: boolean | null
    }>
  }>,
  highestRated: Array<{
    myRating: number,
    id: string,
    title: string,
    year: number | null,
    durationMs: number | null,
    status: VideoStatus,
    published: boolean,
    progressSeconds: number | null,
    finished: boolean,
    averageRating: number | null,
    ratingCount: number,
    liked: boolean,
    kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
    spex: Array<{
      id: string,
      title: string | null,
      familyId: string,
      categoryName: string | null,
      revival: boolean | null
    }>
  }>,
  recentVideos: Array<{
    id: string,
    title: string,
    year: number | null,
    durationMs: number | null,
    status: VideoStatus,
    published: boolean,
    progressSeconds: number | null,
    finished: boolean,
    averageRating: number | null,
    ratingCount: number,
    liked: boolean,
    kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
    spex: Array<{
      id: string,
      title: string | null,
      familyId: string,
      categoryName: string | null,
      revival: boolean | null
    }>
  }>,
  topVideos: Array<{
    id: string,
    title: string,
    year: number | null,
    durationMs: number | null,
    status: VideoStatus,
    published: boolean,
    progressSeconds: number | null,
    finished: boolean,
    averageRating: number | null,
    ratingCount: number,
    liked: boolean,
    kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
    spex: Array<{
      id: string,
      title: string | null,
      familyId: string,
      categoryName: string | null,
      revival: boolean | null
    }>
  }>,
  likedVideos: Array<{
    id: string,
    title: string,
    year: number | null,
    durationMs: number | null,
    status: VideoStatus,
    published: boolean,
    progressSeconds: number | null,
    finished: boolean,
    averageRating: number | null,
    ratingCount: number,
    liked: boolean,
    kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
    spex: Array<{
      id: string,
      title: string | null,
      familyId: string,
      categoryName: string | null,
      revival: boolean | null
    }>
  }>,
  categories: Array<{ id: string, name: string, videoCount: number }>
};

export type VideosQueryVariables = Exact<{
  filter?: VideoFilter | null | undefined;
}>;


export type VideosQuery = {
  years: Array<number>,
  videos: Array<{
    id: string,
    title: string,
    year: number | null,
    durationMs: number | null,
    status: VideoStatus,
    published: boolean,
    progressSeconds: number | null,
    finished: boolean,
    averageRating: number | null,
    ratingCount: number,
    liked: boolean,
    kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
    spex: Array<{
      id: string,
      title: string | null,
      familyId: string,
      categoryName: string | null,
      revival: boolean | null
    }>
  }>,
  categories: Array<{ id: string, name: string, videoCount: number }>,
  videoKinds: Array<{ id: string, nameSv: string, nameEn: string, isDefault: boolean }>
};

export type VideoKindsQueryVariables = Exact<{ [key: string]: never; }>;


export type VideoKindsQuery = {
  videoKinds: Array<{
    position: number,
    videoCount: number,
    id: string,
    nameSv: string,
    nameEn: string,
    isDefault: boolean
  }>
};

export type VideoQueryVariables = Exact<{
  id: string | number;
}>;


export type VideoQuery = {
  video: {
    id: string,
    title: string,
    year: number | null,
    performance: string | null,
    performanceDate: string | null,
    description: string | null,
    status: VideoStatus,
    failure: string | null,
    durationMs: number | null,
    width: number | null,
    height: number | null,
    published: boolean,
    publishedAt: string | null,
    trashedAt: string | null,
    originalName: string | null,
    originalSize: number | null,
    originalKept: boolean,
    hasThumbnails: boolean,
    posterSeconds: number | null,
    progressSeconds: number | null,
    finished: boolean,
    inWatchList: boolean,
    liked: boolean,
    likeCount: number,
    myRating: number,
    averageRating: number | null,
    ratingCount: number,
    createdAt: string,
    lastModifiedAt: string | null,
    kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
    spex: Array<{
      id: string,
      title: string | null,
      year: number | null,
      revival: boolean | null,
      parentId: string | null,
      familyId: string,
      categoryId: string | null,
      categoryName: string | null
    }>,
    renditions: Array<{ height: number, width: number, bitrateKbps: number, copied: boolean, size: number }>,
    chapters: Array<{
      startSeconds: number,
      title: string,
      spexifyTrackId: string | null,
      spexifyTrackTitle: string | null
    }>,
    subtitles: Array<{ language: string, label: string }>,
    job: {
      id: string,
      status: string,
      progress: number,
      attempts: number,
      error: string | null,
      createdAt: string,
      startedAt: string | null,
      finishedAt: string | null
    } | null,
    collections: Array<{ id: string, title: string }>,
    next: {
      id: string,
      title: string,
      year: number | null,
      durationMs: number | null,
      kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean }
    } | null
  } | null
};

export type CollectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type CollectionsQuery = {
  collections: Array<{
    id: string,
    title: string,
    description: string | null,
    createdAt: string,
    lastModifiedAt: string | null,
    videos: Array<{
      id: string,
      title: string,
      year: number | null,
      durationMs: number | null,
      status: VideoStatus,
      published: boolean,
      progressSeconds: number | null,
      finished: boolean,
      averageRating: number | null,
      ratingCount: number,
      liked: boolean,
      kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
      spex: Array<{
        id: string,
        title: string | null,
        familyId: string,
        categoryName: string | null,
        revival: boolean | null
      }>
    }>
  }>
};

export type CollectionQueryVariables = Exact<{
  id: string | number;
}>;


export type CollectionQuery = {
  collection: {
    id: string,
    title: string,
    description: string | null,
    createdAt: string,
    lastModifiedAt: string | null,
    videos: Array<{
      id: string,
      title: string,
      year: number | null,
      durationMs: number | null,
      status: VideoStatus,
      published: boolean,
      progressSeconds: number | null,
      finished: boolean,
      averageRating: number | null,
      ratingCount: number,
      liked: boolean,
      kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
      spex: Array<{
        id: string,
        title: string | null,
        familyId: string,
        categoryName: string | null,
        revival: boolean | null
      }>
    }>
  } | null
};

export type PlaybackQueryVariables = Exact<{
  videoId: string | number;
}>;


export type PlaybackQuery = {
  playback: {
    masterUrl: string,
    thumbnailsUrl: string | null,
    expiresAt: string,
    subtitles: Array<{ language: string, label: string, url: string }>
  }
};

export type SearchQueryVariables = Exact<{
  q: string;
}>;


export type SearchQuery = {
  search: Array<{
    id: string,
    title: string,
    year: number | null,
    durationMs: number | null,
    status: VideoStatus,
    published: boolean,
    progressSeconds: number | null,
    finished: boolean,
    averageRating: number | null,
    ratingCount: number,
    liked: boolean,
    kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
    spex: Array<{
      id: string,
      title: string | null,
      familyId: string,
      categoryName: string | null,
      revival: boolean | null
    }>
  }>
};

export type WatchListQueryVariables = Exact<{ [key: string]: never; }>;


export type WatchListQuery = {
  watchList: Array<{
    id: string,
    title: string,
    year: number | null,
    durationMs: number | null,
    status: VideoStatus,
    published: boolean,
    progressSeconds: number | null,
    finished: boolean,
    averageRating: number | null,
    ratingCount: number,
    liked: boolean,
    kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
    spex: Array<{
      id: string,
      title: string | null,
      familyId: string,
      categoryName: string | null,
      revival: boolean | null
    }>
  }>
};

export type LikedQueryVariables = Exact<{ [key: string]: never; }>;


export type LikedQuery = {
  likedVideos: Array<{
    id: string,
    title: string,
    year: number | null,
    durationMs: number | null,
    status: VideoStatus,
    published: boolean,
    progressSeconds: number | null,
    finished: boolean,
    averageRating: number | null,
    ratingCount: number,
    liked: boolean,
    kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
    spex: Array<{
      id: string,
      title: string | null,
      familyId: string,
      categoryName: string | null,
      revival: boolean | null
    }>
  }>
};

export type TopQueryVariables = Exact<{
  by: TopBy;
  filter?: VideoFilter | null | undefined;
  limit?: number | null | undefined;
}>;


export type TopQuery = {
  years: Array<number>,
  topVideos: Array<{
    likeCount: number,
    id: string,
    title: string,
    year: number | null,
    durationMs: number | null,
    status: VideoStatus,
    published: boolean,
    progressSeconds: number | null,
    finished: boolean,
    averageRating: number | null,
    ratingCount: number,
    liked: boolean,
    kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
    spex: Array<{
      id: string,
      title: string | null,
      familyId: string,
      categoryName: string | null,
      revival: boolean | null
    }>
  }>,
  categories: Array<{ id: string, name: string, videoCount: number }>
};

export type PlaylistsQueryVariables = Exact<{ [key: string]: never; }>;


export type PlaylistsQuery = {
  playlists: Array<{
    id: string,
    name: string,
    description: string | null,
    isPublic: boolean,
    owned: boolean,
    ownerName: string | null,
    itemCount: number,
    durationSeconds: number,
    updatedAt: string,
    items: Array<{ id: string, video: { id: string } }>
  }>
};

export type PlaylistQueryVariables = Exact<{
  id: string | number;
}>;


export type PlaylistQuery = {
  playlist: {
    id: string,
    name: string,
    description: string | null,
    isPublic: boolean,
    owned: boolean,
    ownerName: string | null,
    itemCount: number,
    durationSeconds: number,
    createdAt: string,
    updatedAt: string,
    items: Array<{
      id: string,
      startSeconds: number | null,
      endSeconds: number | null,
      title: string | null,
      durationSeconds: number,
      video: {
        id: string,
        title: string,
        year: number | null,
        durationMs: number | null,
        status: VideoStatus,
        published: boolean,
        progressSeconds: number | null,
        finished: boolean,
        averageRating: number | null,
        ratingCount: number,
        liked: boolean,
        kind: { id: string, nameSv: string, nameEn: string, isDefault: boolean },
        spex: Array<{
          id: string,
          title: string | null,
          familyId: string,
          categoryName: string | null,
          revival: boolean | null
        }>
      }
    }>
  } | null
};

export type PlaylistFieldsFragment = { id: string, name: string, itemCount: number };

export type SpexSearchQueryVariables = Exact<{
  q: string;
}>;


export type SpexSearchQuery = {
  spexSearch: Array<{
    id: string,
    title: string | null,
    year: number | null,
    revival: boolean,
    parentId: string | null,
    categoryName: string | null
  }>
};

export type SpexifyTracksQueryVariables = Exact<{
  videoId: string | number;
}>;


export type SpexifyTracksQuery = {
  spexifyTracks: Array<{ id: string, title: string, discNumber: number, trackNumber: number, albumTitle: string }>
};

export type VideoKindCreateMutationVariables = Exact<{
  input: VideoKindInput;
}>;


export type VideoKindCreateMutation = { videoKindCreate: { id: string } };

export type VideoKindUpdateMutationVariables = Exact<{
  id: string | number;
  input: VideoKindInput;
}>;


export type VideoKindUpdateMutation = { videoKindUpdate: { id: string } };

export type VideoKindsReorderMutationVariables = Exact<{
  ids: Array<string | number> | string | number;
}>;


export type VideoKindsReorderMutation = { videoKindsReorder: Array<{ id: string }> };

export type VideoKindDeleteMutationVariables = Exact<{
  id: string | number;
}>;


export type VideoKindDeleteMutation = { videoKindDelete: null | null };

export type VideoCreateMutationVariables = Exact<{
  input: VideoInput;
}>;


export type VideoCreateMutation = { videoCreate: { id: string } };

export type VideoUpdateMutationVariables = Exact<{
  id: string | number;
  input: VideoInput;
}>;


export type VideoUpdateMutation = { videoUpdate: { id: string } };

export type VideoSetFileMutationVariables = Exact<{
  id: string | number;
  uploadId: string;
}>;


export type VideoSetFileMutation = { videoSetFile: { id: string, status: VideoStatus } };

export type VideoPublishMutationVariables = Exact<{
  id: string | number;
  published: boolean;
}>;


export type VideoPublishMutation = { videoPublish: { id: string } };

export type VideoTrashMutationVariables = Exact<{
  id: string | number;
}>;


export type VideoTrashMutation = { videoTrash: { id: string } };

export type VideoRestoreMutationVariables = Exact<{
  id: string | number;
}>;


export type VideoRestoreMutation = { videoRestore: { id: string } };

export type VideoDeleteMutationVariables = Exact<{
  id: string | number;
}>;


export type VideoDeleteMutation = { videoDelete: null | null };

export type VideoPosterFrameMutationVariables = Exact<{
  id: string | number;
  seconds: number;
}>;


export type VideoPosterFrameMutation = { videoPosterFrame: { id: string } };

export type VideoReprocessMutationVariables = Exact<{
  id: string | number;
}>;


export type VideoReprocessMutation = { videoReprocess: { id: string } };

export type ChaptersSetMutationVariables = Exact<{
  videoId: string | number;
  chapters: Array<ChapterInput> | ChapterInput;
}>;


export type ChaptersSetMutation = { chaptersSet: { id: string } };

export type SubtitleRemoveMutationVariables = Exact<{
  videoId: string | number;
  language: string;
}>;


export type SubtitleRemoveMutation = { subtitleRemove: { id: string } };

export type ProgressSaveMutationVariables = Exact<{
  videoId: string | number;
  positionSeconds: number;
}>;


export type ProgressSaveMutation = { progressSave: null | null };

export type VideoRateMutationVariables = Exact<{
  videoId: string | number;
  rating: number;
}>;


export type VideoRateMutation = { videoRate: null | null };

export type WatchListAddMutationVariables = Exact<{
  videoId: string | number;
}>;


export type WatchListAddMutation = { watchListAdd: null | null };

export type WatchListRemoveMutationVariables = Exact<{
  videoId: string | number;
}>;


export type WatchListRemoveMutation = { watchListRemove: null | null };

export type ProgressClearMutationVariables = Exact<{
  videoId: string | number;
}>;


export type ProgressClearMutation = { progressClear: null | null };

export type VideoMarkWatchedMutationVariables = Exact<{
  videoId: string | number;
}>;


export type VideoMarkWatchedMutation = { videoMarkWatched: null | null };

export type VideoLikeMutationVariables = Exact<{
  videoId: string | number;
  liked: boolean;
}>;


export type VideoLikeMutation = { videoLike: null | null };

export type PlaylistCreateMutationVariables = Exact<{
  input: PlaylistInput;
}>;


export type PlaylistCreateMutation = { playlistCreate: { id: string, name: string, itemCount: number } };

export type PlaylistUpdateMutationVariables = Exact<{
  id: string | number;
  input: PlaylistInput;
}>;


export type PlaylistUpdateMutation = { playlistUpdate: { id: string, name: string, itemCount: number } };

export type PlaylistDeleteMutationVariables = Exact<{
  id: string | number;
}>;


export type PlaylistDeleteMutation = { playlistDelete: null | null };

export type PlaylistAddItemMutationVariables = Exact<{
  playlistId: string | number;
  videoId: string | number;
  startSeconds?: number | null | undefined;
}>;


export type PlaylistAddItemMutation = { playlistAddItem: { id: string, name: string, itemCount: number } };

export type PlaylistRemoveItemMutationVariables = Exact<{
  playlistId: string | number;
  itemId: string | number;
}>;


export type PlaylistRemoveItemMutation = { playlistRemoveItem: { id: string, name: string, itemCount: number } };

export type PlaylistReorderMutationVariables = Exact<{
  playlistId: string | number;
  itemIds: Array<string | number> | string | number;
}>;


export type PlaylistReorderMutation = { playlistReorder: { id: string, name: string, itemCount: number } };

export type CollectionCreateMutationVariables = Exact<{
  input: CollectionInput;
}>;


export type CollectionCreateMutation = { collectionCreate: { id: string } };

export type CollectionUpdateMutationVariables = Exact<{
  id: string | number;
  input: CollectionInput;
}>;


export type CollectionUpdateMutation = { collectionUpdate: { id: string } };

export type CollectionDeleteMutationVariables = Exact<{
  id: string | number;
}>;


export type CollectionDeleteMutation = { collectionDelete: null | null };

export const KindFieldsFragmentDoc = {
  "kind": "Document",
  "definitions": [{
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }],
} as unknown as DocumentNode<KindFieldsFragment, unknown>;
export const VideoCardFieldsFragmentDoc = {
  "kind": "Document", "definitions": [{
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "VideoCardFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Video" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "title" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "kind" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "durationMs" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "status" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "published" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "progressSeconds" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "finished" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "averageRating" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "ratingCount" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "liked" },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "spex" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "familyId" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "categoryName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "revival" } }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }],
} as unknown as DocumentNode<VideoCardFieldsFragment, unknown>;
export const PlaylistFieldsFragmentDoc = {
  "kind": "Document",
  "definitions": [{
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "PlaylistFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Playlist" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "name" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "itemCount" } }],
    },
  }],
} as unknown as DocumentNode<PlaylistFieldsFragment, unknown>;
export const TrashDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Trash" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "trash" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "trashedAt" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "status" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<TrashQuery, TrashQueryVariables>;
export const QueueDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Queue" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "processingQueue" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "videoId" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "videoTitle" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "status" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "progress" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "attempts" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "error" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "createdAt" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "startedAt" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "finishedAt" },
          }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<QueueQuery, QueueQueryVariables>;
export const StorageDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Storage" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "storage" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "originalsBytes" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "renditionsBytes" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "freeBytes" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "videoCount" },
          }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<StorageQuery, StorageQueryVariables>;
export const AuditLogDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "AuditLog" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "page" } },
      "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "Int" } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "size" } },
      "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "Int" } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "filter" } },
      "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "AuditFilter" } },
    }],
    "selectionSet": {
      "kind": "SelectionSet", "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "auditLog" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "page" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "page" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "size" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "size" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "filter" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "filter" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "totalCount" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "page" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "size" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "entries" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "at" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "actorId" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "actorName" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "action" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "entityType" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "entityId" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "summary" },
              }],
            },
          }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<AuditLogQuery, AuditLogQueryVariables>;
export const AuditActorsDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "AuditActors" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "auditActors" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "name" },
          }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<AuditActorsQuery, AuditActorsQueryVariables>;
export const SettingsDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Settings" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "settings" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "welcomeSv" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "welcomeEn" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "maxUploadGb" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "keepOriginals" },
          }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<SettingsQuery, SettingsQueryVariables>;
export const TrashEmptyDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "TrashEmpty" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "trashEmpty" } }],
    },
  }],
} as unknown as DocumentNode<TrashEmptyMutation, TrashEmptyMutationVariables>;
export const SettingsUpdateDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "SettingsUpdate" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
      "type": {
        "kind": "NonNullType",
        "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "SettingsInput" } },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "settingsUpdate" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "input" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "welcomeSv" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<SettingsUpdateMutation, SettingsUpdateMutationVariables>;
export const MaintenanceJobsDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "MaintenanceJobs" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "maintenanceJobs" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "job" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "schedule" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "running" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "lastStartedAt" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "lastFinishedAt" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "lastSucceeded" },
          }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<MaintenanceJobsQuery, MaintenanceJobsQueryVariables>;
export const MaintenanceJobRunDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "MaintenanceJobRun" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "job" } },
      "type": {
        "kind": "NonNullType",
        "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "MaintenanceJob" } },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "maintenanceJobRun" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "job" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "job" } },
        }],
      }],
    },
  }],
} as unknown as DocumentNode<MaintenanceJobRunMutation, MaintenanceJobRunMutationVariables>;
export const MeDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Me" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "me" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "username" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "displayName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "roles" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "spexifyUser" },
          }],
        },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "settings" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "welcomeSv" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "welcomeEn" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "maxUploadGb" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "keepOriginals" },
          }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const HomeDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition", "operation": "query", "name": { "kind": "Name", "value": "Home" }, "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "continueWatching" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "limit" },
          "value": { "kind": "IntValue", "value": "12" },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "VideoCardFields" } }],
        },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "highestRated" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "limit" },
          "value": { "kind": "IntValue", "value": "12" },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "FragmentSpread",
            "name": { "kind": "Name", "value": "VideoCardFields" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "myRating" } }],
        },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "recentVideos" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "limit" },
          "value": { "kind": "IntValue", "value": "12" },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "VideoCardFields" } }],
        },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "topVideos" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "by" },
          "value": { "kind": "EnumValue", "value": "RATED" },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "limit" },
          "value": { "kind": "IntValue", "value": "6" },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "VideoCardFields" } }],
        },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "likedVideos" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "VideoCardFields" } }],
        },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "categories" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "name" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "videoCount" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "years" } }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "VideoCardFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Video" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "title" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "kind" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "durationMs" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "status" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "published" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "progressSeconds" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "finished" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "averageRating" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "ratingCount" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "liked" },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "spex" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "familyId" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "categoryName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "revival" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<HomeQuery, HomeQueryVariables>;
export const VideosDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Videos" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "filter" } },
      "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoFilter" } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videos" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "filter" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "filter" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "VideoCardFields" } }],
        },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "categories" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "name" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "videoCount" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "years" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoKinds" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "VideoCardFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Video" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "title" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "kind" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "durationMs" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "status" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "published" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "progressSeconds" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "finished" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "averageRating" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "ratingCount" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "liked" },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "spex" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "familyId" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "categoryName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "revival" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<VideosQuery, VideosQueryVariables>;
export const VideoKindsDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "VideoKinds" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoKinds" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "FragmentSpread",
            "name": { "kind": "Name", "value": "KindFields" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "position" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "videoCount" },
          }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }],
} as unknown as DocumentNode<VideoKindsQuery, VideoKindsQueryVariables>;
export const VideoDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Video" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet", "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "video" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "kind" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
            },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "performance" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "performanceDate" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "description" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "status" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "failure" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "durationMs" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "width" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "height" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "published" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "publishedAt" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "trashedAt" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "originalName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "originalSize" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "originalKept" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "hasThumbnails" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "posterSeconds" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "progressSeconds" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "finished" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "inWatchList" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "liked" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "likeCount" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "myRating" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "averageRating" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "ratingCount" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "createdAt" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "lastModifiedAt" },
          }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "spex" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "title" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "revival" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "parentId" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "familyId" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "categoryId" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "categoryName" },
              }],
            },
          }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "renditions" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "height" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "width" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "bitrateKbps" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "copied" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "size" } }],
            },
          }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "chapters" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{
                "kind": "Field",
                "name": { "kind": "Name", "value": "startSeconds" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "title" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "spexifyTrackId" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "spexifyTrackTitle" } }],
            },
          }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "subtitles" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "language" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "label" },
              }],
            },
          }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "job" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "status" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "progress" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "attempts" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "error" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "createdAt" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "startedAt" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "finishedAt" },
              }],
            },
          }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "collections" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "title" },
              }],
            },
          }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "next" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "title" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "kind" },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
                },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "durationMs" } }],
            },
          }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }],
} as unknown as DocumentNode<VideoQuery, VideoQueryVariables>;
export const CollectionsDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Collections" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "collections" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "description" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "createdAt" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "lastModifiedAt" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "videos" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "VideoCardFields" } }],
            },
          }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "VideoCardFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Video" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "title" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "kind" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "durationMs" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "status" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "published" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "progressSeconds" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "finished" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "averageRating" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "ratingCount" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "liked" },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "spex" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "familyId" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "categoryName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "revival" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<CollectionsQuery, CollectionsQueryVariables>;
export const CollectionDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Collection" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "collection" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "description" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "createdAt" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "lastModifiedAt" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "videos" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "VideoCardFields" } }],
            },
          }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "VideoCardFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Video" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "title" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "kind" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "durationMs" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "status" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "published" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "progressSeconds" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "finished" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "averageRating" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "ratingCount" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "liked" },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "spex" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "familyId" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "categoryName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "revival" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<CollectionQuery, CollectionQueryVariables>;
export const PlaybackDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Playback" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "playback" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "videoId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "masterUrl" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "thumbnailsUrl" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "expiresAt" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "subtitles" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "language" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "label" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "url" } }],
            },
          }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<PlaybackQuery, PlaybackQueryVariables>;
export const SearchDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Search" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "q" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "String" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "search" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "q" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "q" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "VideoCardFields" } }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "VideoCardFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Video" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "title" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "kind" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "durationMs" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "status" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "published" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "progressSeconds" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "finished" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "averageRating" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "ratingCount" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "liked" },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "spex" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "familyId" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "categoryName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "revival" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<SearchQuery, SearchQueryVariables>;
export const WatchListDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "WatchList" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "watchList" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "VideoCardFields" } }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "VideoCardFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Video" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "title" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "kind" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "durationMs" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "status" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "published" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "progressSeconds" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "finished" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "averageRating" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "ratingCount" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "liked" },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "spex" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "familyId" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "categoryName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "revival" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<WatchListQuery, WatchListQueryVariables>;
export const LikedDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Liked" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "likedVideos" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "VideoCardFields" } }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "VideoCardFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Video" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "title" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "kind" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "durationMs" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "status" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "published" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "progressSeconds" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "finished" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "averageRating" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "ratingCount" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "liked" },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "spex" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "familyId" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "categoryName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "revival" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<LikedQuery, LikedQueryVariables>;
export const TopDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Top" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "by" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "TopBy" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "filter" } },
      "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoFilter" } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "limit" } },
      "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "Int" } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "topVideos" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "by" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "by" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "filter" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "filter" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "limit" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "limit" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{
            "kind": "FragmentSpread",
            "name": { "kind": "Name", "value": "VideoCardFields" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "likeCount" } }],
        },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "categories" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "name" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "videoCount" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "years" } }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "VideoCardFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Video" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "title" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "kind" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "durationMs" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "status" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "published" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "progressSeconds" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "finished" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "averageRating" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "ratingCount" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "liked" },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "spex" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "familyId" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "categoryName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "revival" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<TopQuery, TopQueryVariables>;
export const PlaylistsDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Playlists" },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "playlists" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "name" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "description" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "isPublic" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "owned" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "ownerName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "itemCount" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "durationSeconds" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "updatedAt" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "items" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "video" },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
                },
              }],
            },
          }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<PlaylistsQuery, PlaylistsQueryVariables>;
export const PlaylistDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "Playlist" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet", "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "playlist" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "name" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "description" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "isPublic" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "owned" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "ownerName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "itemCount" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "durationSeconds" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "createdAt" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "updatedAt" },
          }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "items" },
            "selectionSet": {
              "kind": "SelectionSet",
              "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "startSeconds" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "endSeconds" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "title" },
              }, { "kind": "Field", "name": { "kind": "Name", "value": "durationSeconds" } }, {
                "kind": "Field",
                "name": { "kind": "Name", "value": "video" },
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "VideoCardFields" } }],
                },
              }],
            },
          }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "KindFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKind" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "nameSv" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "nameEn" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "isDefault" },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "VideoCardFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Video" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "title" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "kind" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "KindFields" } }],
        },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "durationMs" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "status" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "published" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "progressSeconds" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "finished" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "averageRating" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "ratingCount" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "liked" },
      }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "spex" },
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "familyId" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "categoryName" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "revival" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<PlaylistQuery, PlaylistQueryVariables>;
export const SpexSearchDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "SpexSearch" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "q" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "String" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "spexSearch" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "q" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "q" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "year" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "revival" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "parentId" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "categoryName" },
          }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<SpexSearchQuery, SpexSearchQueryVariables>;
export const SpexifyTracksDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": { "kind": "Name", "value": "SpexifyTracks" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "spexifyTracks" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "videoId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "title" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "discNumber" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "trackNumber" },
          }, { "kind": "Field", "name": { "kind": "Name", "value": "albumTitle" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<SpexifyTracksQuery, SpexifyTracksQueryVariables>;
export const VideoKindCreateDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoKindCreate" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
      "type": {
        "kind": "NonNullType",
        "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKindInput" } },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoKindCreate" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "input" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<VideoKindCreateMutation, VideoKindCreateMutationVariables>;
export const VideoKindUpdateDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoKindUpdate" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
      "type": {
        "kind": "NonNullType",
        "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoKindInput" } },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoKindUpdate" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "input" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<VideoKindUpdateMutation, VideoKindUpdateMutationVariables>;
export const VideoKindsReorderDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoKindsReorder" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "ids" } },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "ListType",
          "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
        },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoKindsReorder" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "ids" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "ids" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<VideoKindsReorderMutation, VideoKindsReorderMutationVariables>;
export const VideoKindDeleteDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoKindDelete" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoKindDelete" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }],
      }],
    },
  }],
} as unknown as DocumentNode<VideoKindDeleteMutation, VideoKindDeleteMutationVariables>;
export const VideoCreateDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoCreate" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
      "type": {
        "kind": "NonNullType",
        "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoInput" } },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoCreate" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "input" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<VideoCreateMutation, VideoCreateMutationVariables>;
export const VideoUpdateDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoUpdate" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
      "type": {
        "kind": "NonNullType",
        "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "VideoInput" } },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoUpdate" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "input" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<VideoUpdateMutation, VideoUpdateMutationVariables>;
export const VideoSetFileDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoSetFile" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "uploadId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "String" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoSetFile" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "uploadId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "uploadId" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
            "kind": "Field",
            "name": { "kind": "Name", "value": "status" },
          }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<VideoSetFileMutation, VideoSetFileMutationVariables>;
export const VideoPublishDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoPublish" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "published" } },
      "type": {
        "kind": "NonNullType",
        "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "Boolean" } },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoPublish" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "published" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "published" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<VideoPublishMutation, VideoPublishMutationVariables>;
export const VideoTrashDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoTrash" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoTrash" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<VideoTrashMutation, VideoTrashMutationVariables>;
export const VideoRestoreDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoRestore" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoRestore" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<VideoRestoreMutation, VideoRestoreMutationVariables>;
export const VideoDeleteDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoDelete" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoDelete" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }],
      }],
    },
  }],
} as unknown as DocumentNode<VideoDeleteMutation, VideoDeleteMutationVariables>;
export const VideoPosterFrameDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoPosterFrame" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "seconds" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "Float" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoPosterFrame" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "seconds" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "seconds" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<VideoPosterFrameMutation, VideoPosterFrameMutationVariables>;
export const VideoReprocessDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoReprocess" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoReprocess" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<VideoReprocessMutation, VideoReprocessMutationVariables>;
export const ChaptersSetDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "ChaptersSet" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "chapters" } },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "ListType",
          "type": {
            "kind": "NonNullType",
            "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ChapterInput" } },
          },
        },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "chaptersSet" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "videoId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "chapters" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "chapters" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<ChaptersSetMutation, ChaptersSetMutationVariables>;
export const SubtitleRemoveDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "SubtitleRemove" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "language" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "String" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "subtitleRemove" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "videoId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "language" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "language" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<SubtitleRemoveMutation, SubtitleRemoveMutationVariables>;
export const ProgressSaveDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "ProgressSave" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "positionSeconds" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "Int" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "progressSave" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "videoId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "positionSeconds" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "positionSeconds" } },
        }],
      }],
    },
  }],
} as unknown as DocumentNode<ProgressSaveMutation, ProgressSaveMutationVariables>;
export const VideoRateDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoRate" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "rating" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "Int" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoRate" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "videoId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "rating" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "rating" } },
        }],
      }],
    },
  }],
} as unknown as DocumentNode<VideoRateMutation, VideoRateMutationVariables>;
export const WatchListAddDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "WatchListAdd" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "watchListAdd" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "videoId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
        }],
      }],
    },
  }],
} as unknown as DocumentNode<WatchListAddMutation, WatchListAddMutationVariables>;
export const WatchListRemoveDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "WatchListRemove" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "watchListRemove" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "videoId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
        }],
      }],
    },
  }],
} as unknown as DocumentNode<WatchListRemoveMutation, WatchListRemoveMutationVariables>;
export const ProgressClearDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "ProgressClear" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "progressClear" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "videoId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
        }],
      }],
    },
  }],
} as unknown as DocumentNode<ProgressClearMutation, ProgressClearMutationVariables>;
export const VideoMarkWatchedDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoMarkWatched" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoMarkWatched" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "videoId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
        }],
      }],
    },
  }],
} as unknown as DocumentNode<VideoMarkWatchedMutation, VideoMarkWatchedMutationVariables>;
export const VideoLikeDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "VideoLike" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "liked" } },
      "type": {
        "kind": "NonNullType",
        "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "Boolean" } },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "videoLike" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "videoId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "liked" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "liked" } },
        }],
      }],
    },
  }],
} as unknown as DocumentNode<VideoLikeMutation, VideoLikeMutationVariables>;
export const PlaylistCreateDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "PlaylistCreate" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
      "type": {
        "kind": "NonNullType",
        "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "PlaylistInput" } },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "playlistCreate" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "input" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "PlaylistFields" } }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "PlaylistFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Playlist" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "name" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "itemCount" } }],
    },
  }],
} as unknown as DocumentNode<PlaylistCreateMutation, PlaylistCreateMutationVariables>;
export const PlaylistUpdateDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "PlaylistUpdate" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
      "type": {
        "kind": "NonNullType",
        "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "PlaylistInput" } },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "playlistUpdate" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "input" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "PlaylistFields" } }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "PlaylistFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Playlist" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "name" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "itemCount" } }],
    },
  }],
} as unknown as DocumentNode<PlaylistUpdateMutation, PlaylistUpdateMutationVariables>;
export const PlaylistDeleteDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "PlaylistDelete" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "playlistDelete" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }],
      }],
    },
  }],
} as unknown as DocumentNode<PlaylistDeleteMutation, PlaylistDeleteMutationVariables>;
export const PlaylistAddItemDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "PlaylistAddItem" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "playlistId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "startSeconds" } },
      "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "Int" } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "playlistAddItem" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "playlistId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "playlistId" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "videoId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "videoId" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "startSeconds" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "startSeconds" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "PlaylistFields" } }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "PlaylistFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Playlist" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "name" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "itemCount" } }],
    },
  }],
} as unknown as DocumentNode<PlaylistAddItemMutation, PlaylistAddItemMutationVariables>;
export const PlaylistRemoveItemDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "PlaylistRemoveItem" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "playlistId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "itemId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "playlistRemoveItem" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "playlistId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "playlistId" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "itemId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "itemId" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "PlaylistFields" } }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "PlaylistFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Playlist" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "name" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "itemCount" } }],
    },
  }],
} as unknown as DocumentNode<PlaylistRemoveItemMutation, PlaylistRemoveItemMutationVariables>;
export const PlaylistReorderDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "PlaylistReorder" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "playlistId" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "itemIds" } },
      "type": {
        "kind": "NonNullType",
        "type": {
          "kind": "ListType",
          "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
        },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "playlistReorder" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "playlistId" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "playlistId" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "itemIds" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "itemIds" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "FragmentSpread", "name": { "kind": "Name", "value": "PlaylistFields" } }],
        },
      }],
    },
  }, {
    "kind": "FragmentDefinition",
    "name": { "kind": "Name", "value": "PlaylistFields" },
    "typeCondition": { "kind": "NamedType", "name": { "kind": "Name", "value": "Playlist" } },
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }, {
        "kind": "Field",
        "name": { "kind": "Name", "value": "name" },
      }, { "kind": "Field", "name": { "kind": "Name", "value": "itemCount" } }],
    },
  }],
} as unknown as DocumentNode<PlaylistReorderMutation, PlaylistReorderMutationVariables>;
export const CollectionCreateDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "CollectionCreate" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
      "type": {
        "kind": "NonNullType",
        "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "CollectionInput" } },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "collectionCreate" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "input" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<CollectionCreateMutation, CollectionCreateMutationVariables>;
export const CollectionUpdateDocument = {
  "kind": "Document", "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "CollectionUpdate" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }, {
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
      "type": {
        "kind": "NonNullType",
        "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "CollectionInput" } },
      },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "collectionUpdate" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }, {
          "kind": "Argument",
          "name": { "kind": "Name", "value": "input" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "input" } },
        }],
        "selectionSet": {
          "kind": "SelectionSet",
          "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "id" } }],
        },
      }],
    },
  }],
} as unknown as DocumentNode<CollectionUpdateMutation, CollectionUpdateMutationVariables>;
export const CollectionDeleteDocument = {
  "kind": "Document",
  "definitions": [{
    "kind": "OperationDefinition",
    "operation": "mutation",
    "name": { "kind": "Name", "value": "CollectionDelete" },
    "variableDefinitions": [{
      "kind": "VariableDefinition",
      "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
      "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "ID" } } },
    }],
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [{
        "kind": "Field",
        "name": { "kind": "Name", "value": "collectionDelete" },
        "arguments": [{
          "kind": "Argument",
          "name": { "kind": "Name", "value": "id" },
          "value": { "kind": "Variable", "name": { "kind": "Name", "value": "id" } },
        }],
      }],
    },
  }],
} as unknown as DocumentNode<CollectionDeleteMutation, CollectionDeleteMutationVariables>;