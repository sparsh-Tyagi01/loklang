import "dotenv/config";
import express, { Request, Response } from "express";
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
import uploadRouter from "./routes/upload.js";
import { scannerService } from "./services/ScannerService.js";

const PORT = process.env.PORT || 8000;
const ROOT_DIR = path.resolve("data/music");

fs.mkdirSync("data", { recursive: true });
fs.mkdirSync(ROOT_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());

const sseClients = new Set<Response>();

app.get("/api/events", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.add(res);

  _req.on("close", () => {
    sseClients.delete(res);
  });
});

export function broadcastLibraryUpdate() {
  for (const client of sseClients) {
    client.write("data: library-updated\n\n");
  }
}

scannerService.setOnLibraryUpdate(broadcastLibraryUpdate);

app.use("/api/songs", songsRouter);
app.use("/api/albums", albumsRouter);
app.use("/api/artists", artistsRouter);
app.use("/api/stream", streamRouter);
app.use("/api/pictures", picturesRouter);
app.use("/api/playlists", playlistsRouter);
app.use("/api/qr", qrRouter);
app.use("/api/upload", uploadRouter);

const clientDist = path.resolve("../frontend/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("{*splat}", (_req: Request, res: Response) => res.sendFile(path.join(clientDist, "index.html")));
}

async function start() {
  const musicPath = path.resolve(ROOT_DIR);
  console.log(`Scanning "${musicPath}" for music...`);
  await scannerService.scanDir(musicPath);
  console.log("Scan complete.");

  scannerService.watchMusicDir(musicPath);

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Loklang running at http://localhost:${PORT}`);
  });
}

start();
