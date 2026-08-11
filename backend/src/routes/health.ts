import { Router, Request, Response } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/liveness", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get("/readiness", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(503).json({
      status: "unavailable",
      database: "error",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
