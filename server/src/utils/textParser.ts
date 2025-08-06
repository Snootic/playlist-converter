import { detectSource } from "@common/detectSource";

export function normalizeText(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

export function tokenize(text: string): Set<string> {
    const stopwords = new Set<string>(["the", "a", "is", "and", "to", "in", "of"]);
    return new Set(text.split(/\s+/).filter(word => !stopwords.has(word)));
}

export function parseISO8601Duration(duration: string): number {
    const regex = /PT(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);
  
    const minutes = parseInt(matches?.[1] || "0", 10);
    const seconds = parseInt(matches?.[2] || "0", 10);
  
    return minutes * 60 + seconds;
}

export function parseVideoTitle(videoTitle: string): string {
    const stopwords: string[] = [
      "official video", "official audio", "official", "remix", "new song",
      "live", "music video", "performance", "feat.", "ft.", "featuring",
      "lyric video", "lyrics video", "with lyrics", "lyrics", "hq", "hd",
       "()"
    ];
  
    let cleanTitle = videoTitle.toLowerCase()
      .replace(/[\[\]\(\)\|]/g, '')
      .replace(/[^a-z0-9\s\-]/g, '')
      .trim();
  
    stopwords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleanTitle = cleanTitle.replace(regex, '');
    });

    const parts = cleanTitle.split(/[-|]/).map(part => part.trim());

    if (parts.length < 2) {
      return cleanTitle;
    }
  
    const artist = parts[0];
    const song = parts.slice(1).join(' - ');
  
    return `${artist} ${song}`;
}

export function parseTitle(title: string, source: any): string {
  let sourceName = detectSource(source)
  switch (sourceName) {
    case "YouTube":
      return parseVideoTitle(title)
    case "Spotify":
      return `${source.album.artists[0].name} - ${title}`
    default:
      return ""
  }

}