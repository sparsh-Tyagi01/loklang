import { Router } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../db.js";

const router = Router();

router.get("/:albumId", async (req, res) => {
  const album = await prisma.album.findUnique({ where: { id: req.params.albumId } });

  if (!album?.coverImage || !fs.existsSync(album.coverImage)) {
    return res.status(404).send("No cover image");
  }

  res.sendFile(path.resolve(album.coverImage));
});

export default router;