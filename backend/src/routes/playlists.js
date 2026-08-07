import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../db.js";

const router = Router();

function newId() {
  return crypto.randomUUID();
}

router.get("/", async (req, res) => {
  const playlists = await prisma.playlist.findMany({
    include: { songs: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(playlists);
});

router.get("/:id", async (req, res) => {
  const playlist = await prisma.playlist.findUnique({
    where: { id: req.params.id },
    include: {
      songs: {
        orderBy: { position: "asc" },
        include: { song: { include: { album: true, artists: { include: { artist: true } } } } },
      },
    },
  });

  if (!playlist) return res.status(404).json({ error: "Playlist not found" });
  res.json(playlist);
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name is required" });

  const playlist = await prisma.playlist.create({
    data: { id: newId(), name: name.trim() },
  });

  res.status(201).json(playlist);
});

router.delete("/:id", async (req, res) => {
  await prisma.playlistSong.deleteMany({ where: { playlistId: req.params.id } });
  await prisma.playlist.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

router.post("/:id/songs", async (req, res) => {
  const { songId } = req.body;
  const playlistId = req.params.id;

  const lastEntry = await prisma.playlistSong.findFirst({
    where: { playlistId },
    orderBy: { position: "desc" },
  });
  const nextPosition = lastEntry ? lastEntry.position + 1 : 0;

  await prisma.playlistSong.upsert({
    where: { playlistId_songId: { playlistId, songId } },
    update: {},
    create: { playlistId, songId, position: nextPosition },
  });

  res.status(201).json({ ok: true });
});

router.delete("/:id/songs/:songId", async (req, res) => {
  await prisma.playlistSong.delete({
    where: {
      playlistId_songId: { playlistId: req.params.id, songId: req.params.songId },
    },
  });
  res.status(204).send();
});

export default router;