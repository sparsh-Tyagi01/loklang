import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const artists = await prisma.artist.findMany({ orderBy: { sortName: "asc" } });
  res.json(artists);
});

router.get("/:id", async (req, res) => {
  const artist = await prisma.artist.findUnique({
    where: { id: req.params.id },
    include: {
      songs: { include: { song: { include: { album: true } } } },
    },
  });

  if (!artist) return res.status(404).json({ error: "Artist not found" });
  res.json(artist);
});

export default router;