import { Match, ScoreDetails, SpotifyTrack, YouTubeVideo } from "@types"

export type detectSourceProps = {
  source: SpotifyTrack | YouTubeVideo
}

export const sources = {
  spotify: "Spotify",
  youtube: "YouTube"
}

export function detectSource(source: detectSourceProps['source']): string | undefined {
  if ("album" in source && "artists" in source) {
    return sources.spotify
  }
  if ("videoId" in source && "title" in source) {
    return sources.youtube
  }
  return undefined
}

export function mapSource(source : detectSourceProps['source']) {
  const sourceName = detectSource(source);

  if (sourceName === "Spotify") {
    const spotifySource = source as SpotifyTrack;
    return {
      name: sourceName,
      title: spotifySource.name,
      url: spotifySource.external_urls.spotify,
      thumbnail: spotifySource.album.images[1]?.url || spotifySource.album.images[0]?.url || "",
      author: spotifySource.artists[0]?.name || ""
    };
  } else if (sourceName === "YouTube") {
    const youtubeSource = source as YouTubeVideo;
    return {
      name: sourceName,
      title: youtubeSource.title,
      url: youtubeSource.url,
      thumbnail: youtubeSource.thumbnail,
      author: youtubeSource.author.name
    };
  }
  return undefined;
}

export function mapMatch(match: detectSourceProps['source'], score: ScoreDetails): Match | undefined {
  const sourceName = detectSource(match);

  let totalScore = Object.values(score).reduce((sum, val) => (sum as number) + (val as number), 0)

  if (sourceName === "Spotify") {
    const spotifySource = match as SpotifyTrack;
    return {
      title: spotifySource.name,
      url: spotifySource.external_urls.spotify,
      thumbnailUrl: spotifySource.album.images[1]?.url || spotifySource.album.images[0]?.url || "",
      scoreDetails: score,
      totalScore: totalScore
    };
  } else if (sourceName === "YouTube") {
    const youtubeSource = match as YouTubeVideo;
    return {
      title: youtubeSource.title,
      url: youtubeSource.url,
      thumbnailUrl: youtubeSource.thumbnail,
      scoreDetails: score,
      totalScore: totalScore
    };
  }
  return undefined;
} 