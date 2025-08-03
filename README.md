# Playlist Converter 🎶

Plataform available at [This Link](https://converter.coisas-mais-estranhas.com.br).

This app aims to convert any playlist from any platform to any platform (currently supporting only Youtube and Spotify). It relys on Google Youtube Data API and Spotify API for searching for and fetch songs and create playlists.

## To run yourself


### Backend Server
1. Open server directory

   ```bash
   cd server
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the server

   ```bash
   npm run dev
   ```

### Frontend Client App
1. Install dependencies

   ```bash
   npm install
   ```

2. Start the APP

   ```bash
   npx expo start
   ```
The app will become available at `localhost:8081` and the backend on `localhost:3001`, remember to set the proper environment variables into the `.env` files at the root directory and inside server folder.