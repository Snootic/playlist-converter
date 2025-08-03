export interface VideoMetadata {
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

export interface YouTubeVideo {
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

export interface YouTubePlaylist {
  type: string;
  listId: string;
  title: string;
  size: number;
  videos: YouTubeVideo[];
}
