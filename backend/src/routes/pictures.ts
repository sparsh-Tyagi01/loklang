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

  const contentType = (mime.lookup(album.coverImage) as string) || "image/jpeg";
  res.setHeader("Content-Type", contentType);
  fs.createReadStream(album.coverImage).pipe(res);
});

export default router;
