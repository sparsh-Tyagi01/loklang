import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import songsRouter from "./routes/songs.js";
import albumsRouter from "./routes/albums.js";
import artistsRouter from "./routes/artists.js";
import streamRouter from "./routes/stream.js";
import picturesRouter from "./routes/pictures.js";
import playlistsRouter from "./routes/playlists.js";
import qrRouter from "./routes/qr.js";
import { scanDir, watchMusicDir, setOnLibraryUpdate } from "./scanner.js";

const PORT = process.env.PORT || 8000;
const ROOT_DIR = process.env.ROOT_DIR || "./music";

fs.mkdirSync("data", { recursive: true });

const app = express();
app.use(cors());
app.use(express.json()); 

const sseClients = new Set();

app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.add(res);

  req.on("close", () => {
    sseClients.delete(res);
  });
});

export function broadcastLibraryUpdate() {
  for (const client of sseClients) {
    client.write("data: library-updated\n\n");
  }
}

setOnLibraryUpdate(broadcastLibraryUpdate);

app.use("/api/songs", songsRouter);
app.use("/api/albums", albumsRouter);
app.use("/api/artists", artistsRouter);
app.use("/api/stream", streamRouter);
app.use("/api/pictures", picturesRouter);
app.use("/api/playlists", playlistsRouter);
app.use("/api/qr", qrRouter);

const clientDist = path.resolve("../frontend/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("{*splat}", (req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

async function start() {
  const musicPath = path.resolve(ROOT_DIR);
  console.log(`Scanning "${musicPath}" for music...`);
  await scanDir(musicPath);
  console.log("Scan complete.");

  watchMusicDir(musicPath);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Loklang running at http://localhost:${PORT}`);
  });
}

start();