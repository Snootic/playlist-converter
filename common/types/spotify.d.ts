export type {
  SimplifiedAlbum as SpotifyAlbum,
  SimplifiedArtist as SpotifyArtist,
  Playlist as SpotifyPlaylist,
  PlaylistedTrack as SpotifyPlaylistTrack,
  Track as SpotifyTrack,
  UserProfile as SpotifyUser
} from '@spotify/web-api-ts-sdk';

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  public?: boolean;
  collaborative?: boolean;
}