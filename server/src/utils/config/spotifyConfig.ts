import {AuthConfig} from "@types";

export function getSpotifyConfig(): AuthConfig {
  return {
    scope: process.env.SPOTIFY_SCOPE || '',
    clientID: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  };
}
