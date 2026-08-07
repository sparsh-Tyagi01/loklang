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

router.get("/:id", async (req, res) => {
  const song = await prisma.song.findUnique({
    where: { id: req.params.id },
    include: { album: true, artists: { include: { artist: true } } },
  });

  if (!song) return res.status(404).json({ error: "Song not found" });
  res.json(song);
});

export default router;