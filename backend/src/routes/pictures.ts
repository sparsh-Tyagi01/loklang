import { Router, Request, Response } from "express";
import fs from "fs";
import mime from "mime-types";
import { libraryService } from "../services/LibraryService.js";

const router = Router();

router.get("/:albumId", async (req: Request, res: Response) => {
  const albumId = req.params.albumId as string;
  const album = await libraryService.getAlbumById(albumId);
  if (!album || !album.coverImage || !fs.existsSync(album.coverImage)) {
    return res.status(404).send("Cover image not found");
  }

  const stat = fs.statSync(album.coverImage);
  const etag = `W/"${stat.size}-${stat.mtime.getTime()}"`;

  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
  res.setHeader("ETag", etag);

  if (req.headers["if-none-match"] === etag) {
    return res.status(304).end();
  }

  const contentType = (mime.lookup(album.coverImage) as string) || "image/jpeg";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", stat.size);
  fs.createReadStream(album.coverImage).pipe(res);
});

export default router;
