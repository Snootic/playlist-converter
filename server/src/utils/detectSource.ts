import { SpotifyTrack, YouTubeVideo } from "@types"
import { getSpotifyConfig } from "@/utils/config/spotifyConfig"
import { getYouTubeConfig } from "@/utils/config/youtubeConfig"
import { detectSource, detectSourceProps } from "@common/detectSource"

export function getConfig(platform: string) {
  if (platform.toLocaleLowerCase() === "spotify") {
    return getSpotifyConfig()
  }
  if (platform.toLocaleLowerCase() === "youtube") {
    return getYouTubeConfig()
  }
  return undefined;
}

export async function getMetadata(playlistItem: detectSourceProps['source'], sourceClass: any) {
  let metadata;
  const source = detectSource(playlistItem)

  if (source == "Spotify") {
    const track = playlistItem as SpotifyTrack
    // needs to implement
  }
  if (source == "YouTube") {
    const video = playlistItem as YouTubeVideo
    metadata = await sourceClass.getVideoMetadata(video)
  }

  return metadata
}