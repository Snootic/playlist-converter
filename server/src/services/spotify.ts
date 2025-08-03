import score from "@/utils/score";
import { parseTitle } from "@/utils/textParser";
import { AccessToken, SpotifyApi } from "@spotify/web-api-ts-sdk";
import {
  AuthConfig,
  ConversionResult,
  CreatePlaylistRequest,
  Playlist,
  SpotifyPlaylist,
  SpotifyPlaylistTrack,
  SpotifyTrack,
  Match
} from "@types";
import { getConfig } from "../utils/detectSource";
import { mapMatch } from "@common/detectSource";

export class SpotifyService {
  private API: SpotifyApi;
  private access_token: AccessToken;
  private clientID: AuthConfig['clientID'];

  constructor(access_token: AccessToken){
    const config = getConfig('Spotify')
    if (!config) {
      throw new Error('No configuration find for spotify, could not initialize API')
    }
    this.access_token = access_token
    this.clientID = config['clientID']

    this.API = SpotifyApi.withAccessToken(this.clientID, this.access_token)
  }

  private playlistIdParser(playlistUrl: string): string {
    const playlistId = playlistUrl.split("/playlist/")[1].split("?")[0];
    return playlistId;
  }

  private async checkMatches(spotifyTracks: SpotifyTrack[], original: any): Promise<Match[]> {
    const matches = new Array<Match>();

    await Promise.all(spotifyTracks.map(async (track: SpotifyTrack) => {
      const scoreDetails = score(track, original);

      if (scoreDetails === null) {
        return;
      }
      
      const match = mapMatch(track, scoreDetails)

      matches.push(match);
    }));

    const sortedMatches = matches.sort((a, b) => b.totalScore - a.totalScore);

    return sortedMatches;
  }

  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    if (playlistId.includes("/playlist/")) {
      playlistId = this.playlistIdParser(playlistId);
    }
    // TODO: implement cache with redis? Or maybe a 24hour cache with mongo will be sufficient
    // if (tracksCache.has(playlistId)) {
    //   console.log(`Cache hit for playlist ${playlistId}`);
    //   return tracksCache.get(playlistId)!;
    // }

    const playlist = await this.API.playlists.getPlaylist(playlistId)
      .catch(err => {
        console.log(err);
        throw err;
      });

    // playlistCache.set(playlistId, playlist);

    const totalTracks = playlist.tracks.total;

    let tracks: SpotifyTrack[] = [];

    while (tracks.length < totalTracks) {
      const result = await this.API.playlists.getPlaylistItems(playlistId, undefined, undefined, 50, tracks.length);

      tracks = tracks.concat(result.items.map((item: SpotifyPlaylistTrack<SpotifyTrack>) => item.track));
    }

    // tracksCache.set(playlistId, tracks);

    return tracks;
  }

  private async searchTrack(title: string): Promise<SpotifyTrack[]>  {    
    const query = parseTitle(title);

    const search = await this.API.search(query, ['track'], undefined, 20);

    const tracks = search.tracks.items;

    return tracks;
  }

  async convert(playlistItem: any): ConversionResult<any> {
    const tracks = await this.searchTrack(playlistItem.title)
    const matches = await this.checkMatches(tracks, playlistItem)

    let bestMatch = null;
    if ( matches.length > 0 ) {
      bestMatch = matches[0]
    }

    return {playlistItem, bestMatch, matches}
    
    // for (const item of playlist) {
      
    //   const tracks = await this.searchTrack(item.title);
    //   const matches = await this.checkMatches(tracks, item);

    //   if (matches.length > 0) {
    //     const bestMatch = matches[0][0];

    //     yield { ConversionResult: { item, bestMatch, matches } };
    //   } else {
    //     yield { ConversionResult: { item, bestMatch: null, matches: [] } };
    //   }
    // }
  }

  async createPlaylist(tracksUriList: string[], createPlaylistRequest: CreatePlaylistRequest): Promise<SpotifyPlaylist> {
    let profile = await this.API.currentUser.profile()
    let userId = profile.id
	
    let playlist = await this.API.playlists.createPlaylist(userId, createPlaylistRequest);
    await this.API.playlists.addItemsToPlaylist(playlist.id, tracksUriList)

    return playlist
  }
}