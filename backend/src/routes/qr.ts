import { Router, Request, Response } from "express";
import os from "os";
import QRCode from "qrcode";

const router = Router();

function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

router.get("/", async (_req: Request, res: Response) => {
  const port = process.env.PORT || 8000;
  const ip = getLocalIp();
  const url = `http://${ip}:${port}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(url);
    res.json({ url, qrDataUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
