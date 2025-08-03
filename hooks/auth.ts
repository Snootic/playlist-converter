import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import API_URL from '@/constants/api';
import * as WebBrowser from 'expo-web-browser';

export async function login(platform: string) {
  const redirectUri = (makeRedirectUri({ scheme: "playlistconverter", path: "callback", }))

  const response = await fetch(`${API_URL}/authenticate?redirect_uri=${redirectUri}&platform=${platform}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    }
  });

  if (!response.ok) {
    return response
  }

  WebBrowser.maybeCompleteAuthSession();

  const { url } = await response.json();
  if (url) {
    await WebBrowser.openAuthSessionAsync(url, redirectUri);
  }
  

  return true
}

export async function refreshTokens(platform: string, code?: string, refresh_token?: string) {
  const redirectUri = (makeRedirectUri({ scheme: "playlistconverter", path: "callback", }))

  console.log(redirectUri)

  const body = {
    platform: platform,
    code: code,
    refresh_token: refresh_token,
    redirect_uri: redirectUri
  }

  const urlEncodedBody = Object.entries(body)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
    .join('&');

  const response = await fetch(`${API_URL}/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: urlEncodedBody,
  });

  if (!response.ok) {
    return false
  }

  return await response.json()

  return true
}

export async function isTokenExpired(platform: string): Promise<boolean> {
  try {
    const tokenData = await AsyncStorage.getItem(`${platform}TokenData`);
    if (!tokenData) return true;

    const tokens = JSON.parse(tokenData);
    if (!tokens.expires_at) return true;

    const bufferTime = 5 * 60 * 1000;
    return Date.now() >= (tokens.expires_at - bufferTime);
  } catch {
    return true;
  }
}

export async function isAuthenticated(platform: string): Promise<boolean> {
  try {
    const tokenData = await AsyncStorage.getItem(`${platform}TokenData`);
    if (!tokenData) return false;

    const tokens = JSON.parse(tokenData);
    if (!tokens.access_token) return false;

    if (await isTokenExpired(platform)) {
      const refreshToken = tokens.refresh_token
      const refreshed = await refreshTokens(platform, undefined, refreshToken);
      return !!refreshed;
    }

    return true;
  } catch {
    return false;
  }
}

export async function getTokenData(platform: string) {
  try {
    const authenticated = await isAuthenticated(platform);
    if (!authenticated) return null;

    const tokenData = await AsyncStorage.getItem(`${platform}TokenData`);
    if (!tokenData) return null;

    const tokens = JSON.parse(tokenData);
    return tokens;
  } catch {
    return null;
  }
}

export async function logout(platform: string): Promise<void> {
  await AsyncStorage.multiRemove([
    `${platform}TokenData`,
  ]);
}