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
import { scanDir } from "./scanner.js";

const PORT = process.env.PORT || 8000;
const ROOT_DIR = process.env.ROOT_DIR || "./music";

fs.mkdirSync("data", { recursive: true });

const app = express();
app.use(cors());

app.use("/api/songs", songsRouter);
app.use("/api/albums", albumsRouter);
app.use("/api/artists", artistsRouter);
app.use("/api/stream", streamRouter);
app.use("/api/pictures", picturesRouter);

async function start() {
  console.log(`Scanning "${ROOT_DIR}" for music...`);
  await scanDir(path.resolve(ROOT_DIR));
  console.log("Scan complete.");

  app.listen(PORT, () => {
    console.log(`Loklang server running at http://localhost:${PORT}`);
  });
}

start();