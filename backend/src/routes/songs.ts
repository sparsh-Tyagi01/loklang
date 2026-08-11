import { Router, Request, Response } from "express";
import path from "path";
import { libraryService } from "../services/LibraryService.js";
import { scannerService } from "../services/ScannerService.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const songs = await libraryService.getAllSongs();
  res.json(songs);
});

router.post("/rescan", async (_req: Request, res: Response) => {
  try {
    const rootDir = path.resolve("data/music");
    await scannerService.scanDir(rootDir);
    res.json({ message: "Rescan complete" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/favorites/all", async (_req: Request, res: Response) => {
  const favorites = await libraryService.getFavoriteSongs();
  res.json(favorites);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const song = await libraryService.getSongById(id);
  if (!song) return res.status(404).json({ error: "Song not found" });
  res.json(song);
});

router.patch("/:id/favorite", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const updated = await libraryService.toggleFavorite(id);
  if (!updated) return res.status(404).json({ error: "Song not found" });
  res.json(updated);
});

export default router;
