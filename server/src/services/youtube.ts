import score from '@/utils/score';
import { parseISO8601Duration, parseTitle } from '@/utils/textParser';
import { Track } from '@spotify/web-api-ts-sdk';
import { ConversionResult, Playlist, TrackMatch, VideoMetadata, YouTubeVideo } from '@types';
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
  
  async getVideoMetadata(video: YouTubeVideo): Promise<VideoMetadata> {
    let videoMetadata: VideoMetadata | null = null;
    let attempts = 0;
    let success = false;
    
    while (attempts < 5 && !success) {
      console.log(`attempt ${attempts} for ${video.videoId}`);
      try {
        const result = await yts({ videoId: video.videoId });
        videoMetadata = result as VideoMetadata;
        success = true;
      } catch (error) {
        console.log(error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
    
    if (!videoMetadata) {
      throw new Error(`Failed to get metadata for video ${video.videoId} after ${attempts} attempts`);
    }
    
    return videoMetadata;
  }
  
  async checkMatches(videos: YouTubeVideo[], original: any): Promise<Array<[VideoMetadata, TrackMatch<VideoMetadata>]>> {
    const matches = new Map<VideoMetadata, TrackMatch<VideoMetadata>>();
  
    await Promise.all(videos.map(async (video, index) => {    
      const videoMetadata = await this.getVideoMetadata(video);
  
      const scoreDetails = score(original, videoMetadata);
  
      if (scoreDetails === null) {
        return;
      }
  
      const totalScore = Object.values(scoreDetails).reduce((sum, value) => (sum as number) + (value as number), 0);
  
      matches.set(videoMetadata, { totalScore, scoreDetails });
    }));
  
    const allViews = new Map<VideoMetadata, number>();
    matches.forEach((value, key) => {
      allViews.set(key, key.views);
    });
  
    const sortedViews = [...allViews.entries()].sort((a, b) => b[1] - a[1]);
    if (sortedViews.length > 0) {
      const topVideo = sortedViews[0][0];
      const topMatch = matches.get(topVideo);
      if (topMatch) {
        topMatch.scoreDetails.bonus += 2;
        topMatch.totalScore += 2;
      }
    }
  
    const sortedMatches = [...matches.entries()].sort((a, b) => {
      if (b[1].totalScore === a[1].totalScore) {
        return b[0].views - a[0].views;
      }
      return b[1].totalScore - a[1].totalScore;
    });
  
    return sortedMatches;
  }
  
  async searchTrack(title: string): Promise<YouTubeVideo[]> {
    const query = parseTitle(title);

    let result: any = null;
  
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
  
    if (!result) {
      throw new Error(`Failed to search for ${query} after ${attempts} attempts`);
    }
  
    const videos = result.videos.slice(0, 10);
  
    return videos;
  }
  
  async convert(playlistItem: any): ConversionResult<any> {
    const videos = await this.searchTrack(playlistItem.title)
    const matches = await this.checkMatches(videos, playlistItem)

    let bestMatch = null;
    if ( matches.length > 0 ) {
      bestMatch = matches[0][0]
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