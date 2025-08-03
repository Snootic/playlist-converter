import { SpotifyService } from '@/services/spotify';
import { YoutubeService } from '@/services/youtube';
import { getMetadata } from '@/utils/detectSource';
import { AccessToken } from '@spotify/web-api-ts-sdk';
import { Request, Response, Router } from 'express';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const origin = req.body.origin
  const originToken = req.body.origin_token
  const destination = req.body.destination
  let destinationTokenData = req.body.destination_token_data
  const playlistURl = req.body.playlist_url

  let clientDisconnected = false;
  res.on('close', () => {
    clientDisconnected = true;
    res.end();
  });

  let playlistItems;
  let originClass;
  let destinationClass;

  destinationTokenData =  JSON.parse(destinationTokenData);

  switch (origin) {
    case 'YouTube':
      originClass = new YoutubeService(originToken);
      playlistItems = await originClass.getPlaylistTracks(playlistURl);
  }
  
  if (!playlistItems) {
    throw new Error("Playlist empty or not found")
  }

  switch (destination) {
    case 'Spotify':
      const spotifyToken: AccessToken = {
        access_token: destinationTokenData.access_token,
        token_type: destinationTokenData.token_type,
        expires_in: destinationTokenData.expires_in,
        expires: destinationTokenData.expires,
        refresh_token: destinationTokenData.refresh_token
      };
      
      destinationClass = new SpotifyService(spotifyToken)
  }

  if (!destinationClass) {
    throw new Error("Destination service not initialized");
  }

  for (let item of playlistItems) {
    if (clientDisconnected) break;
    item = await getMetadata(item, originClass);
    const result = await destinationClass.convert(item);
    res.write(`${JSON.stringify(result)}\n`);
  }

  res.end()
})

export default router