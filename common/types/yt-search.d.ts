// Type definitions for yt-search package since it doesn't have official types
declare module 'yt-search' {
  interface VideoResult {
    type: string;
    videoId: string;
    title: string;
    description: string;
    author: {
      name: string;
      channelID: string;
      url: string;
    };
    seconds: number;
    timestamp: string;
    views: number;
    url: string;
    thumbnail: string;
    ago: string;
    duration: {
      seconds: number;
      timestamp: string;
    };
  }

  interface PlaylistResult {
    type: string;
    listId: string;
    title: string;
    size: number;
    videos: VideoResult[];
  }

  interface SearchResult {
    videos: VideoResult[];
    playlists: PlaylistResult[];
    all: (VideoResult | PlaylistResult)[];
  }

  interface VideoMetadataResult {
    videoId: string;
    title: string;
    description: string;
    author: {
      name: string;
      channelID?: string;
      url?: string;
    };
    seconds: number;
    timestamp: string;
    views: number;
    url: string;
    thumbnail?: string;
    ago?: string;
    duration?: {
      seconds: number;
      timestamp: string;
    };
  }

  function yts(query: string): Promise<SearchResult>;
  function yts(options: { videoId: string }): Promise<VideoMetadataResult>;
  function yts(options: { listId: string }): Promise<PlaylistResult>;

  export = yts;
}
