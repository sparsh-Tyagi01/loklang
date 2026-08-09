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
import { scanDir } from "./scanner.js";

import { Bonjour } from "bonjour-service";

const PORT = process.env.PORT || 8000;
const ROOT_DIR = process.env.ROOT_DIR || "./music";

fs.mkdirSync("data", { recursive: true });

const app = express();
app.use(cors());

app.use(express.json()); 

app.use("/api/songs", songsRouter);
app.use("/api/albums", albumsRouter);
app.use("/api/artists", artistsRouter);
app.use("/api/stream", streamRouter);
app.use("/api/pictures", picturesRouter);
app.use("/api/playlists", playlistsRouter);

async function start() {
  console.log(`Scanning "${ROOT_DIR}" for music...`);
  await scanDir(path.resolve(ROOT_DIR));
  console.log("Scan complete.");

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Loklang running at http://localhost:${PORT}`);

    const bonjour = new Bonjour();
    bonjour.publish({
      name: "Loklang Music Server",
      type: "http",
      host: "loklang.local",
      port: Number(PORT),
    });

    console.log(`Also discoverable at http://loklang.local:${PORT}`);

    process.on("SIGINT", () => {
      bonjour.unpublishAll(() => process.exit(0));
    });
  });
}

start();