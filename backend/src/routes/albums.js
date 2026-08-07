import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const albums = await prisma.album.findMany({
    include: { artists: { include: { artist: true } } },
    orderBy: { title: "asc" },
  });
  res.json(albums);
});

router.get("/:id", async (req, res) => {
  const album = await prisma.album.findUnique({
    where: { id: req.params.id },
    include: {
      songs: { orderBy: { title: "asc" } },
      artists: { include: { artist: true } },
    },
  });

  if (!album) return res.status(404).json({ error: "Album not found" });
  res.json(album);
});

export default router;