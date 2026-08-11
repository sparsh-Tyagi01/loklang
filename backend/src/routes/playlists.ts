import { Router, Request, Response } from "express";
import crypto from "crypto";
import { libraryService } from "../services/LibraryService.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const playlists = await libraryService.getAllPlaylists();
  res.json(playlists);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const playlist = await libraryService.getPlaylistById(id);
  if (!playlist) return res.status(404).json({ error: "Playlist not found" });
  res.json(playlist);
});

router.post("/", async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name is required" });

  const id = crypto.randomUUID();
  const playlist = await libraryService.createPlaylist(name.trim(), id);
  res.status(201).json(playlist);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await libraryService.deletePlaylist(id);
  res.status(204).send();
});

router.post("/:id/songs", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { songId } = req.body;
  await libraryService.addSongToPlaylist(id, songId);
  res.status(201).json({ ok: true });
});

router.delete("/:id/songs/:songId", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const songId = req.params.songId as string;
  await libraryService.removeSongFromPlaylist(id, songId);
  res.status(204).send();
});

export default router;
