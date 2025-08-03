import { AuthConfig } from "@/common/types/authConfig"
import { ConversionResult } from "@/common/types/conversionResult"
import { Match } from "@/common/types/match"
import { ScoreDetails } from "@/common/types/score"
import { CreatePlaylistRequest } from "@/common/types/spotify"
import { VideoMetadata, YouTubeVideo, YouTubePlaylist } from "@/common/types/youtube"
import { Playlist } from "@/common/types/playlist"

export type {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyPlaylistTrack,
  SpotifyTrack,
  SpotifyUser
} from "./spotify";

export {
  AuthConfig,
  ConversionResult,
  Match,
  ScoreDetails,
  CreatePlaylistRequest,
  VideoMetadata,
  YouTubeVideo,
  YouTubePlaylist,
  Playlist
}
