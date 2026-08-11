import { Router, Request, Response } from "express";
import fs from "fs";
import mime from "mime-types";
import { libraryService } from "../services/LibraryService.js";
import { scannerService } from "../services/ScannerService.js";

const router = Router();

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const song = await libraryService.getSongById(id);
  if (!song) return res.status(404).send("Song not found");

  const filePath = song.filePath;
  if (!fs.existsSync(filePath)) {
    await scannerService.removeSongById(song.id);
    scannerService.notifyLibraryUpdate();
    return res.status(404).send("File missing on disk");
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const contentType = (mime.lookup(filePath) as string) || "application/octet-stream";
  const range = req.headers.range;

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.writeHead(416, { "Content-Range": `bytes */${fileSize}` });
      return res.end();
    }

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": contentType,
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

export default router;
