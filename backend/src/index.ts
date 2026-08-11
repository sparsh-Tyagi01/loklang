import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { pinoHttp } from "pino-http";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { logger } from "./logger.js";
import { prisma } from "./db.js";
import healthRouter from "./routes/health.js";
import songsRouter from "./routes/songs.js";
import albumsRouter from "./routes/albums.js";
import artistsRouter from "./routes/artists.js";
import streamRouter from "./routes/stream.js";
import picturesRouter from "./routes/pictures.js";
import playlistsRouter from "./routes/playlists.js";
import qrRouter from "./routes/qr.js";
import uploadRouter from "./routes/upload.js";
import { scannerService } from "./services/ScannerService.js";
import { workerPoolService } from "./services/WorkerPoolService.js";

const PORT = process.env.PORT || 8000;
const ROOT_DIR = path.resolve("data/music");

fs.mkdirSync("data", { recursive: true });
fs.mkdirSync(ROOT_DIR, { recursive: true });

export const app = express();

app.use(
  compression({
    filter: (req: Request, res: Response) => {
      if (req.url.startsWith("/api/stream")) return false;
      return compression.filter(req, res);
    },
  })
);

app.use((req: Request, res: Response, next) => {
  const reqId = (req.headers["x-request-id"] as string) || `req-${crypto.randomUUID()}`;
  req.headers["x-request-id"] = reqId;
  res.setHeader("X-Request-Id", reqId);
  next();
});

app.use(
  pinoHttp({
    logger,
    genReqId: (req: Request) => (req.headers["x-request-id"] as string) || `req-${crypto.randomUUID()}`,
    autoLogging: {
      ignore: (req: Request) => req.url === "/api/events" || req.url?.startsWith("/health"),
    },
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use("/api/", apiLimiter);

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

app.use("/health", healthRouter);
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
  logger.info({ musicPath }, "Scanning music directory...");
  await scannerService.scanDir(musicPath);
  logger.info("Scan complete.");

  scannerService.watchMusicDir(musicPath);

  const server = app.listen(Number(PORT), "0.0.0.0", () => {
    logger.info({ port: PORT, url: `http://localhost:${PORT}` }, "Loklang server running");
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Initiating graceful shutdown sequence...");
    server.close(() => {
      logger.info("HTTP server closed");
    });

    for (const client of sseClients) {
      try {
        client.end();
      } catch (e) {}
    }
    sseClients.clear();

    workerPoolService.terminate();
    logger.info("Worker thread pool terminated");

    await prisma.$disconnect();
    logger.info("Database connection closed");

    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

if (process.env.NODE_ENV !== "test") {
  start();
}
