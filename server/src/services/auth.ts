import { AuthConfig } from "@types";
import { generateRandomString } from "@/utils/oAuth2CodeHandler";

export class Auth implements AuthConfig {
  platform: string;
  clientID: string;
  clientSecret: string;
  scope: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;

  constructor(
    platform: string,
    clientID: string,
    clientSecret: string,
    scope: string,
    authorizationEndpoint: string,
    tokenEndpoint: string
  ) {
    this.platform = platform;
    this.clientID = clientID;
    this.clientSecret = clientSecret;
    this.scope = scope;
    this.authorizationEndpoint = authorizationEndpoint;
    this.tokenEndpoint = tokenEndpoint;
  }

  getCodeUri(redirectUri: string) {
    const state = JSON.stringify({
      nonce: generateRandomString(16),
      platform: this.platform
    });
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientID,
      scope: this.scope,
      redirect_uri: redirectUri,
      state: btoa(state)
    });

    console.log(params)

    return {url: `${this.authorizationEndpoint}?${params.toString()}`};
  }

  async authenticate(redirectUri: string, code?: string, refresh_token?: string) {
    let body;
    if (code) {
      body = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: this.clientID,
        client_secret: this.clientSecret,
      });
    }

    if (refresh_token) {
      body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
        redirect_uri: redirectUri,
        client_id: this.clientID,
        client_secret: this.clientSecret,
      });
    }

    if (!body) {
      throw new Error("Either 'code' or 'refresh_token' must be provided for authentication.");
    }

    const response = await fetch(this.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();

    const expiresIn = parseInt(data.expires_in) || 3599;
    const tokenData = {
      ...data,
      expires_at: Date.now() + (expiresIn * 1000)
    }

    return tokenData;
  }
}