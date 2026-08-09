import { Router } from "express";
import QRCode from "qrcode";
import os from "os";

const router = Router();

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4, non-internal (loopback nahi) address dhoondo
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

router.get("/", async (req, res) => {
  const port = process.env.PORT || 8000;
  const ip = getLocalIp();
  const url = `http://${ip}:${port}`;

  try {
    const qrImage = await QRCode.toBuffer(url, { width: 300, margin: 2 });
    res.set("Content-Type", "image/png");
    res.send(qrImage);
  } catch (err) {
    res.status(500).send("Could not generate QR code");
  }
});

router.get("/url", (req, res) => {
  const port = process.env.PORT || 8000;
  const ip = getLocalIp();
  res.json({ url: `http://${ip}:${port}` });
});

export default router;