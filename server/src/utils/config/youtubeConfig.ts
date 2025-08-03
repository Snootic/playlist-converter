import {AuthConfig} from "@types";
export function getYouTubeConfig(): AuthConfig {
  return {
    clientID: process.env.YOUTUBE_CLIENT_ID || '',
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
    scope: process.env.YOUTUBE_SCOPE || '',
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
  };
}