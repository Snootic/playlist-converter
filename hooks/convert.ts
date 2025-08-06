import API_URL from "@/constants/api";
import { getTokenData } from "./auth";
import { ConversionResult } from "@/common/types";

export async function* convert(playlistUrl: string, destination: string) {
  let origin;
  let originToken;

  if (playlistUrl.includes('youtube')) {
    origin = 'YouTube'
  } else if (playlistUrl.includes('spotify')) {
    origin = 'Spotify'
  }

  if (!origin) {
    throw new Error("No origin found")
  }

  const tokenData = await getTokenData(origin)
  originToken = JSON.stringify(tokenData)

  let destinationTokenData = await getTokenData(destination);
  destinationTokenData = JSON.stringify(destinationTokenData);

  const body: Record<string, string> = {
    playlist_url: playlistUrl,
    origin: origin,
    origin_token: originToken,
    destination: destination,
    destination_token_data: destinationTokenData
  };

  const response = await fetch(`${API_URL}/convert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    },
    body: new URLSearchParams(body).toString()
  });

  const reader = response.body?.getReader();
  let buffer = '';
  const decoder = new TextDecoder();

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            const result: ConversionResult<any> = {
              bestMatch: parsed.bestMatch,
              matches: parsed.matches,
              original: parsed.playlistItem
            };
            
            yield result;
          } catch (e) {
            // handle parse error
          }
        }
      }
    }
  }
  return
}