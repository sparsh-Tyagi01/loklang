import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import { libraryService } from "../services/LibraryService.js";

const router = Router();

router.get("/:albumId", async (req: Request, res: Response) => {
  const albumId = req.params.albumId as string;
  const album = await libraryService.getAlbumById(albumId);
  if (!album || !album.coverImage) {
    return res.status(404).send("Cover image not found");
  }

  const resolvedPath = path.resolve(album.coverImage);
  const allowedDir = path.resolve("data/covers");

  if (!resolvedPath.startsWith(allowedDir)) {
    console.warn(`Blocked unauthorized path traversal attempt for cover art: ${resolvedPath}`);
    return res.status(403).send("Forbidden path access");
  }

  if (!fs.existsSync(resolvedPath)) {
    return res.status(404).send("Cover image not found");
  }

  const stat = fs.statSync(resolvedPath);
  const etag = `W/"${stat.size}-${stat.mtime.getTime()}"`;

  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
  res.setHeader("ETag", etag);

  if (req.headers["if-none-match"] === etag) {
    return res.status(304).end();
  }

  const contentType = (mime.lookup(resolvedPath) as string) || "image/jpeg";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", stat.size);
  fs.createReadStream(resolvedPath).pipe(res);
});

export default router;
