import "server-only";

import { graphql } from "@/gql";
import { runMutation, runQuery } from "@/lib/graphql.server";
import type {
  ChapterInput,
  CollectionInput,
  PlaylistInput,
  TopBy,
  VideoFilter,
  VideoInput,
  VideoKindInput,
} from "@/gql/graphql";

export const KindFieldsFragment = graphql(`
    fragment KindFields on VideoKind { id nameSv nameEn isDefault }
`);

export const VideoCardFieldsFragment = graphql(`
    fragment VideoCardFields on Video {
        id title year kind { ...KindFields } durationMs status published progressSeconds finished averageRating ratingCount liked
        spex { id title familyId categoryName revival }
    }
`);

const MeQuery = graphql(`
    query Me {
        me { username displayName roles spexifyUser }
        settings { welcomeSv welcomeEn maxUploadGb keepOriginals }
    }
`);

const HomeQuery = graphql(`
    query Home {
        continueWatching(limit: 12) { ...VideoCardFields }
        highestRated(limit: 12) { ...VideoCardFields myRating }
        recentVideos(limit: 12) { ...VideoCardFields }
        topVideos(by: RATED, limit: 6) { ...VideoCardFields }
        likedVideos { ...VideoCardFields }
        categories { id name videoCount }
        years
    }
`);

const VideosQuery = graphql(`
    query Videos($filter: VideoFilter) {
        videos(filter: $filter) {
            ...VideoCardFields
        }
        categories { id name videoCount }
        years
        videoKinds { ...KindFields }
    }
`);

const VideoKindsQuery = graphql(`
    query VideoKinds {
        videoKinds { ...KindFields position videoCount }
    }
`);

const VideoQuery = graphql(`
    query Video($id: ID!) {
        video(id: $id) {
            id title year kind { ...KindFields } performance performanceDate description status failure durationMs width height
            published publishedAt trashedAt originalName originalSize originalKept hasThumbnails posterSeconds
            progressSeconds finished inWatchList liked likeCount myRating averageRating ratingCount createdAt lastModifiedAt
            spex { id title year revival parentId familyId categoryId categoryName }
            renditions { height width bitrateKbps copied size }
            chapters { startSeconds title spexifyTrackId spexifyTrackTitle }
            subtitles { language label }
            job { id status progress attempts error createdAt startedAt finishedAt }
            collections { id title }
            next { id title year kind { ...KindFields } durationMs }
        }
    }
`);

const CollectionsQuery = graphql(`
    query Collections {
        collections {
            id title description createdAt lastModifiedAt
            videos { ...VideoCardFields }
        }
    }
`);

const CollectionQuery = graphql(`
    query Collection($id: ID!) {
        collection(id: $id) {
            id title description createdAt lastModifiedAt
            videos { ...VideoCardFields }
        }
    }
`);

const PlaybackQuery = graphql(`
    query Playback($videoId: ID!) {
        playback(videoId: $videoId) { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }
    }
`);

const SearchQuery = graphql(`
    query Search($q: String!) {
        search(q: $q) { ...VideoCardFields }
    }
`);

const WatchListQuery = graphql(`
    query WatchList {
        watchList { ...VideoCardFields }
    }
`);

const LikedQuery = graphql(`
    query Liked {
        likedVideos { ...VideoCardFields }
    }
`);
const TopQuery = graphql(`
    query Top($by: TopBy!, $filter: VideoFilter, $limit: Int) {
        topVideos(by: $by, filter: $filter, limit: $limit) { ...VideoCardFields likeCount }
        categories { id name videoCount }
        years
    }
`);
const PlaylistsQuery = graphql(`
    query Playlists {
        playlists { id name description isPublic owned ownerName itemCount durationSeconds updatedAt items { id video { id } } }
    }
`);
const PlaylistQuery = graphql(`
    query Playlist($id: ID!) {
        playlist(id: $id) {
            id name description isPublic owned ownerName itemCount durationSeconds createdAt updatedAt
            items { id startSeconds endSeconds title durationSeconds video { ...VideoCardFields } }
        }
    }
`);
export const PlaylistFieldsFragment = graphql(`
    fragment PlaylistFields on Playlist { id name itemCount }
`);
const SpexSearchQuery = graphql(`
    query SpexSearch($q: String!) { spexSearch(q: $q) { id title year revival parentId categoryName } }
`);

const SpexifyTracksQuery = graphql(`
    query SpexifyTracks($videoId: ID!) { spexifyTracks(videoId: $videoId) { id title discNumber trackNumber albumTitle } }
`);

const VideoKindCreateMutation = graphql(`mutation VideoKindCreate($input: VideoKindInput!) { videoKindCreate(input: $input) { id } }`);
const VideoKindUpdateMutation = graphql(`mutation VideoKindUpdate($id: ID!, $input: VideoKindInput!) { videoKindUpdate(id: $id, input: $input) { id } }`);
const VideoKindsReorderMutation = graphql(`mutation VideoKindsReorder($ids: [ID!]!) { videoKindsReorder(ids: $ids) { id } }`);
const VideoKindDeleteMutation = graphql(`mutation VideoKindDelete($id: ID!) { videoKindDelete(id: $id) }`);
const VideoCreateMutation = graphql(`mutation VideoCreate($input: VideoInput!) { videoCreate(input: $input) { id } }`);
const VideoUpdateMutation = graphql(`mutation VideoUpdate($id: ID!, $input: VideoInput!) { videoUpdate(id: $id, input: $input) { id } }`);
const VideoSetFileMutation = graphql(`mutation VideoSetFile($id: ID!, $uploadId: String!) { videoSetFile(id: $id, uploadId: $uploadId) { id status } }`);
const VideoPublishMutation = graphql(`mutation VideoPublish($id: ID!, $published: Boolean!) { videoPublish(id: $id, published: $published) { id } }`);
const VideoTrashMutation = graphql(`mutation VideoTrash($id: ID!) { videoTrash(id: $id) { id } }`);
const VideoRestoreMutation = graphql(`mutation VideoRestore($id: ID!) { videoRestore(id: $id) { id } }`);
const VideoDeleteMutation = graphql(`mutation VideoDelete($id: ID!) { videoDelete(id: $id) }`);
const VideoPosterFrameMutation = graphql(`mutation VideoPosterFrame($id: ID!, $seconds: Float!) { videoPosterFrame(id: $id, seconds: $seconds) { id } }`);
const VideoReprocessMutation = graphql(`mutation VideoReprocess($id: ID!) { videoReprocess(id: $id) { id } }`);
const ChaptersSetMutation = graphql(`mutation ChaptersSet($videoId: ID!, $chapters: [ChapterInput!]!) { chaptersSet(videoId: $videoId, chapters: $chapters) { id } }`);
const SubtitleRemoveMutation = graphql(`mutation SubtitleRemove($videoId: ID!, $language: String!) { subtitleRemove(videoId: $videoId, language: $language) { id } }`);
const ProgressSaveMutation = graphql(`mutation ProgressSave($videoId: ID!, $positionSeconds: Int!) { progressSave(videoId: $videoId, positionSeconds: $positionSeconds) }`);
const VideoRateMutation = graphql(`mutation VideoRate($videoId: ID!, $rating: Int!) { videoRate(videoId: $videoId, rating: $rating) }`);
const WatchListAddMutation = graphql(`mutation WatchListAdd($videoId: ID!) { watchListAdd(videoId: $videoId) }`);
const WatchListRemoveMutation = graphql(`mutation WatchListRemove($videoId: ID!) { watchListRemove(videoId: $videoId) }`);
const ProgressClearMutation = graphql(`mutation ProgressClear($videoId: ID!) { progressClear(videoId: $videoId) }`);
const VideoMarkWatchedMutation = graphql(`mutation VideoMarkWatched($videoId: ID!) { videoMarkWatched(videoId: $videoId) }`);
const VideoLikeMutation = graphql(`mutation VideoLike($videoId: ID!, $liked: Boolean!) { videoLike(videoId: $videoId, liked: $liked) }`);
const PlaylistCreateMutation = graphql(`mutation PlaylistCreate($input: PlaylistInput!) { playlistCreate(input: $input) { ...PlaylistFields } }`);
const PlaylistUpdateMutation = graphql(`mutation PlaylistUpdate($id: ID!, $input: PlaylistInput!) { playlistUpdate(id: $id, input: $input) { ...PlaylistFields } }`);
const PlaylistDeleteMutation = graphql(`mutation PlaylistDelete($id: ID!) { playlistDelete(id: $id) }`);
const PlaylistAddItemMutation = graphql(`mutation PlaylistAddItem($playlistId: ID!, $videoId: ID!, $startSeconds: Int) { playlistAddItem(playlistId: $playlistId, videoId: $videoId, startSeconds: $startSeconds) { ...PlaylistFields } }`);
const PlaylistRemoveItemMutation = graphql(`mutation PlaylistRemoveItem($playlistId: ID!, $itemId: ID!) { playlistRemoveItem(playlistId: $playlistId, itemId: $itemId) { ...PlaylistFields } }`);
const PlaylistReorderMutation = graphql(`mutation PlaylistReorder($playlistId: ID!, $itemIds: [ID!]!) { playlistReorder(playlistId: $playlistId, itemIds: $itemIds) { ...PlaylistFields } }`);
const CollectionCreateMutation = graphql(`mutation CollectionCreate($input: CollectionInput!) { collectionCreate(input: $input) { id } }`);
const CollectionUpdateMutation = graphql(`mutation CollectionUpdate($id: ID!, $input: CollectionInput!) { collectionUpdate(id: $id, input: $input) { id } }`);
const CollectionDeleteMutation = graphql(`mutation CollectionDelete($id: ID!) { collectionDelete(id: $id) }`);

export const getMe = () => runQuery(MeQuery, {});
export const getHome = () => runQuery(HomeQuery, {});
export const getVideos = (filter: VideoFilter) => runQuery(VideosQuery, { filter });
export const getVideo = async (id: string) => (await runQuery(VideoQuery, { id }))?.video ?? null;
export const getPlayback = async (videoId: string) => (await runQuery(PlaybackQuery, { videoId }))?.playback ?? null;
export const search = async (q: string) => (await runQuery(SearchQuery, { q }))?.search ?? [];
export const getWatchList = async () => (await runQuery(WatchListQuery, {}))?.watchList ?? [];
export const getVideoKinds = async () => (await runQuery(VideoKindsQuery, {}))?.videoKinds ?? [];
export const searchSpex = async (q: string) => (await runQuery(SpexSearchQuery, { q }))?.spexSearch ?? [];
export const getSpexifyTracks = async (videoId: string) => (await runQuery(SpexifyTracksQuery, { videoId }))?.spexifyTracks ?? [];

export const videoKindCreate = (input: VideoKindInput) => runMutation(VideoKindCreateMutation, { input });
export const videoKindUpdate = (id: string, input: VideoKindInput) => runMutation(VideoKindUpdateMutation, {
  id,
  input,
});
export const videoKindsReorder = (ids: string[]) => runMutation(VideoKindsReorderMutation, { ids });
export const videoKindDelete = (id: string) => runMutation(VideoKindDeleteMutation, { id });
export const videoCreate = async (input: VideoInput) => (await runMutation(VideoCreateMutation, { input }))?.videoCreate;
export const videoUpdate = (id: string, input: VideoInput) => runMutation(VideoUpdateMutation, { id, input });
export const videoSetFile = (id: string, uploadId: string) => runMutation(VideoSetFileMutation, { id, uploadId });
export const videoPublish = (id: string, published: boolean) => runMutation(VideoPublishMutation, { id, published });
export const videoTrash = (id: string) => runMutation(VideoTrashMutation, { id });
export const videoRestore = (id: string) => runMutation(VideoRestoreMutation, { id });
export const videoDelete = (id: string) => runMutation(VideoDeleteMutation, { id });
export const videoPosterFrame = (id: string, seconds: number) => runMutation(VideoPosterFrameMutation, { id, seconds });
export const videoReprocess = (id: string) => runMutation(VideoReprocessMutation, { id });
export const chaptersSet = (videoId: string, chapters: ChapterInput[]) => runMutation(ChaptersSetMutation, {
  videoId,
  chapters,
});
export const subtitleRemove = (videoId: string, language: string) => runMutation(SubtitleRemoveMutation, {
  videoId,
  language,
});
export const progressSave = (videoId: string, positionSeconds: number) => runMutation(ProgressSaveMutation, {
  videoId,
  positionSeconds,
});
export const videoRate = (videoId: string, rating: number) => runMutation(VideoRateMutation, { videoId, rating });
export const watchListAdd = (videoId: string) => runMutation(WatchListAddMutation, { videoId });
export const watchListRemove = (videoId: string) => runMutation(WatchListRemoveMutation, { videoId });
export const progressClear = (videoId: string) => runMutation(ProgressClearMutation, { videoId });
export const videoMarkWatched = (videoId: string) => runMutation(VideoMarkWatchedMutation, { videoId });
export const getLiked = async () => (await runQuery(LikedQuery, {}))?.likedVideos ?? [];
export const getTop = (by: TopBy, filter: VideoFilter, limit = 50) => runQuery(TopQuery, { by, filter, limit });
export const getPlaylists = async () => (await runQuery(PlaylistsQuery, {}))?.playlists ?? [];
export const getPlaylist = async (id: string) => (await runQuery(PlaylistQuery, { id }))?.playlist ?? null;
export const videoLike = (videoId: string, liked: boolean) => runMutation(VideoLikeMutation, { videoId, liked });
export const playlistCreate = async (input: PlaylistInput) => (await runMutation(PlaylistCreateMutation, { input }))?.playlistCreate;
export const playlistUpdate = (id: string, input: PlaylistInput) => runMutation(PlaylistUpdateMutation, { id, input });
export const playlistDelete = (id: string) => runMutation(PlaylistDeleteMutation, { id });
export const playlistAddItem = (playlistId: string, videoId: string, startSeconds: number | null) =>
  runMutation(PlaylistAddItemMutation, { playlistId, videoId, startSeconds });
export const playlistRemoveItem = (playlistId: string, itemId: string) => runMutation(PlaylistRemoveItemMutation, {
  playlistId,
  itemId,
});
export const playlistReorder = (playlistId: string, itemIds: string[]) => runMutation(PlaylistReorderMutation, {
  playlistId,
  itemIds,
});
export const getCollections = async () => (await runQuery(CollectionsQuery, {}))?.collections ?? [];
export const getCollection = async (id: string) => (await runQuery(CollectionQuery, { id }))?.collection ?? null;
export const collectionCreate = async (input: CollectionInput) => (await runMutation(CollectionCreateMutation, { input }))?.collectionCreate;
export const collectionUpdate = (id: string, input: CollectionInput) => runMutation(CollectionUpdateMutation, {
  id,
  input,
});
export const collectionDelete = (id: string) => runMutation(CollectionDeleteMutation, { id });

/**
 * Spexify's address, for links from chapters to tracks; null when it is not configured.
 */
export function spexifyUrl(): string | null {
  return process.env.SPEXIFY_WEB_URL?.replace(/\/$/, "") || null;
}
