import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const songs = await prisma.song.findMany({
    include: { album: true, artists: { include: { artist: true } } },
    orderBy: { title: "asc" },
  });
  res.json(songs);
});

router.get("/favorites/all", async (req, res) => {
  const favorites = await prisma.song.findMany({
    where: { isFavorite: true },
    include: { album: true, artists: { include: { artist: true } } },
    orderBy: { title: "asc" },
  });
  res.json(favorites);
});

router.get("/:id", async (req, res) => {
  const song = await prisma.song.findUnique({
    where: { id: req.params.id },
    include: { album: true, artists: { include: { artist: true } } },
  });

  if (!song) return res.status(404).json({ error: "Song not found" });
  res.json(song);
});

router.patch("/:id/favorite", async (req, res) => {
  const song = await prisma.song.findUnique({ where: { id: req.params.id } });
  if (!song) return res.status(404).json({ error: "Song not found" });

  const updated = await prisma.song.update({
    where: { id: req.params.id },
    data: { isFavorite: !song.isFavorite },
  });

  res.json(updated);
});

export default router;