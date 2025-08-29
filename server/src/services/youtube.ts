import score from '@/utils/score';
import { parseISO8601Duration, parseTitle } from '@/utils/textParser';
import { mapMatch } from '@common/detectSource';
import { ScoreDetails } from '@common/types/score';
import { Track } from '@spotify/web-api-ts-sdk';
import { ConversionResult, Match, VideoMetadata, YouTubeVideo } from '@types';
import { google, youtube_v3 } from 'googleapis';
import yts from 'yt-search';

export class YoutubeService {
  youtube: youtube_v3.Youtube;

  constructor(access_token: string){
    google.options({ auth: access_token });
    this.youtube = google.youtube("v3");
  }


  // will probably never use these use google api functions
  async searchWithGoogleApi(spotifyTrack: Track): Promise<youtube_v3.Schema$SearchResult[]> {
    const response = await this.youtube.search.list({
      part: ["snippet"],
      q: `${spotifyTrack.name} ${spotifyTrack.artists[0].name} ${spotifyTrack.album.name}`,
      maxResults: 3,
      type: ["video"]
    });
    return response.data.items || [];
  }
  
  async matchesFromGoogleApi(track: Track, videosIds: string[]): Promise<string[]> {
    const response = await this.youtube.videos.list({
      part: ["contentDetails"],
      id: videosIds
    });
  
    let videos = response.data.items || [];
    
    let matchesIds: string[] = [];
  
    for (const video of videos) {
      if (video.contentDetails?.duration) {
        const duration = parseISO8601Duration(video.contentDetails.duration);
        if (!(Math.abs(duration - track.duration_ms / 1000) <= 5)) {
          videos.splice(videos.indexOf(video), 1);
        }
      }
    }
  
    videos.map((video) => {
      if (video.id) {
        matchesIds.push(video.id);
      }
    });
  
    return matchesIds;
  }
  
  async convertWithGoogleApi(spotifyPlaylist: Track[]): Promise<Map<Track, youtube_v3.Schema$SearchResult>> {
    const youtubePlaylist = new Map<Track, youtube_v3.Schema$SearchResult>();
    
    for (const track of spotifyPlaylist) {
      let tracksIds: string[] = [];
      const youtubeTracks = await this.searchWithGoogleApi(track);
      
      youtubeTracks.map((video) => {
        if (video.id?.videoId) {
          tracksIds.push(video.id.videoId);
        }
      });
      
      const matches = await this.matchesFromGoogleApi(track, tracksIds);
  
      youtubeTracks.map((video) => {
        if (video.id?.videoId && matches.includes(video.id.videoId)) {
          youtubePlaylist.set(track, video);
          console.log(track.name, video.snippet?.title, video.id.videoId);
        }
      });
    }
    
    return youtubePlaylist;
  }
  
  async getVideoMetadata(video: YouTubeVideo | string): Promise<YouTubeVideo> {
    let videoMetadata: YouTubeVideo | null = null;
    let attempts = 0;
    let success = false;

    if (typeof video === "string" && video.includes("watch?")) {
      const url = new URL(video, "https://youtube.com");
      const videoId = url.searchParams.get("v");
      if (!videoId) {
        throw new Error("Invalid YouTube video URL");
      }
      video = { videoId } as YouTubeVideo;
    }
    
    while (attempts < 5 && !success) {
      try {
        const result = await yts({ videoId: video.videoId });
        videoMetadata = result as YouTubeVideo;
        success = true;
      } catch (error) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
    
    if (!videoMetadata) {
      throw new Error(`Failed to get metadata for video ${video.videoId} after ${attempts} attempts`);
    }
    
    return videoMetadata;
  }
  
  async checkMatches(videos: YouTubeVideo[], original: any): Promise<Match[]> {
    let matches = new Array<Match>();
    const preMatches = new Map<VideoMetadata, ScoreDetails>();
  
    await Promise.all(videos.map(async (video) => {    
      const videoMetadata = await this.getVideoMetadata(video);
  
      const scoreDetails = score(original, videoMetadata);
      if (scoreDetails === null) {
        return;
      }
      
      preMatches.set(videoMetadata, scoreDetails)
    }));

    if (preMatches.size > 0) {
      const sortedByViews = [...preMatches].sort(
        ([videoMetadataA], [videoMetadataB]) => videoMetadataB.views - videoMetadataA.views
      );
      const topMatch = sortedByViews[0];
      if (topMatch) {
        const [videoMetadata, scoreDetails] = topMatch;
        scoreDetails.bonus += 2;
      }
    }
    matches = Array.from(preMatches.entries()).map(([videoMetadata, scoreDetails]) => mapMatch(videoMetadata, scoreDetails));

    const sortedMatches = [...matches].sort((a, b) => {
      // if (b.totalScore === a.totalScore) {
      //   return b.videoMetadata.views - a.videoMetadata.views;
      // }
      return b.totalScore - a.totalScore;
    });

    return sortedMatches;
  }
  
  async searchTrack(title: string, source: any): Promise<YouTubeVideo[]> {
    const query = parseTitle(title, source);

    let result: yts.SearchResult = {
      all: [],
      videos: [],
      live: [],
      playlists: [],
      accounts: [],
      channels: [],
      lists: []
    }
  
    let attempts = 0;
    let success = false;
    
    while (attempts < 5 && !success) {
      try {
        result = await yts(query);
        success = true;
      } catch (error) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));      
      }
    }
  
    const videos = result.videos.slice(0, 10);
  
    return videos;
  }
  
  async convert(playlistItem: any): ConversionResult<any> {
    const videos = await this.searchTrack(playlistItem.title || playlistItem.name, playlistItem)
    const matches = await this.checkMatches(videos, playlistItem)

    let bestMatch = null;
    if ( matches.length > 0 ) {
      bestMatch = matches[0]
    }

    return {playlistItem, bestMatch, matches}
  }
  
  private playlistIdParser(playlistUrl: string): string {
    const playlistId = playlistUrl.split("list=")[1];
    return playlistId;
  }
  
  async getPlaylistTracks(playlistUrl: string): Promise<YouTubeVideo[]> {	
    const playlistId = this.playlistIdParser(playlistUrl);

    const playlist = await yts({ listId: playlistId });
    const videos: YouTubeVideo[] = [];
  
    console.log(playlist.videos.length);
    console.log(playlist.size); // TODO: find a way to get all videos in the playlist if it has more than 100
    // the current API Client only supports 100 at a time because of ytInitialData only returning it
    
    playlist.videos.map((video) => videos.push(video));

    return videos;
  }
  
  async createPlaylist(): Promise<void> {
    // TODO: Implement YouTube playlist creation
  }
}