export interface AuthConfig {
  clientID: string,
  clientSecret: string,
  scope: string[]
  authorizationEndpoint: string
  tokenEndpoint: string
}