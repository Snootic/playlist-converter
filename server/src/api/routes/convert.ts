import { SpotifyService } from '@/services/spotify';
import { YoutubeService } from '@/services/youtube';
import { getMetadata } from '@/utils/detectSource';
import { AccessToken } from '@spotify/web-api-ts-sdk';
import { Request, Response, Router } from 'express';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const origin = req.body.origin
  let originToken = req.body.origin_token
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
  originToken = JSON.parse(originToken)

  switch (origin) {
    case 'YouTube':
      originClass = new YoutubeService(originToken.access_token);
      playlistItems = await originClass.getPlaylistTracks(playlistURl);
      break;
    case 'Spotify':
    
      const spotifyToken: AccessToken = {
        access_token: originToken.access_token,
        token_type: originToken.token_type,
        expires_in: originToken.expires_in,
        expires: originToken.expires,
        refresh_token: originToken.refresh_token
      };
      
      originClass = new SpotifyService(spotifyToken)
      playlistItems = await originClass.getPlaylistTracks(playlistURl)
      break;
  }
  
  if (!playlistItems) {
    return res.status(400).json({ error: "Playlist Empty or not found" });
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
      break;
    case 'YouTube':
      destinationClass = new YoutubeService(destinationTokenData.access_token)
      break;
  }
  
  if (!destinationClass) {
    return res.status(500).json({ error: "Destination service not intialized, reach out the dev for support." });
  }

  for (let item of playlistItems) {
    if (clientDisconnected) break;
    item = await getMetadata(item, originClass);
    const result = await destinationClass.convert(item);
    res.write(`${JSON.stringify(result)}\n`);
  }

  res.end()
})

router.post('/song', async (req: Request, res: Response) => {
  const origin = req.body.origin
  let originToken = req.body.origin_token
  const destination = req.body.destination
  let destinationTokenData = req.body.destination_token_data
  const songUrl = req.body.song_url

  let clientDisconnected = false;
  res.on('close', () => {
    clientDisconnected = true;
    res.end();
  });

  let song;
  let originClass;
  let destinationClass;

  destinationTokenData =  JSON.parse(destinationTokenData);
  originToken = JSON.parse(originToken)
  switch (origin) {
    case 'YouTube':
      originClass = new YoutubeService(originToken.access_token);
      song = await originClass.getVideoMetadata(songUrl)
      break;
    case 'Spotify':
      const spotifyToken: AccessToken = {
        access_token: originToken.access_token,
        token_type: originToken.token_type,
        expires_in: originToken.expires_in,
        expires: originToken.expires,
        refresh_token: originToken.refresh_token
      };
      
      originClass = new SpotifyService(spotifyToken)
      song = await originClass.getTrack(songUrl)
      break;
  }

  if (!song) {
    return res.status(400).json({ error: "Song not found" });
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
      break;
    case 'YouTube':
      destinationClass = new YoutubeService(destinationTokenData.access_token)
      break;
  }
  
  if (!destinationClass) {
    return res.status(500).json({ error: "Destination service not intialized, reach out the dev for support." });
  }

  let result

  try {
    result = await destinationClass.convert(song);
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }

  return res.status(200).json(JSON.stringify(result))
})

export default router