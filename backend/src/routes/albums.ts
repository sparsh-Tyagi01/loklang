import { Router, Request, Response } from "express";
import { libraryService } from "../services/LibraryService.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const albums = await libraryService.getAllAlbums();
  res.json(albums);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const album = await libraryService.getAlbumById(id);
  if (!album) return res.status(404).json({ error: "Album not found" });
  res.json(album);
});

export default router;
