import { Router, Request, Response } from "express";
import { libraryService } from "../services/LibraryService.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const artists = await libraryService.getAllArtists();
  res.json(artists);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const artist = await libraryService.getArtistById(id);
  if (!artist) return res.status(404).json({ error: "Artist not found" });
  res.json(artist);
});

export default router;
