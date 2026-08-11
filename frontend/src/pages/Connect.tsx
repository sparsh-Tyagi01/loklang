import { useEffect, useState } from "react";
import { QrResponse } from "../types";

export default function Connect() {
  const [qrData, setQrData] = useState<QrResponse | null>(null);

  useEffect(() => {
    fetch("/api/qr")
      .then((res) => res.json())
      .then(setQrData);
  }, []);

  return (
    <div className="detail-page connect-page">
      <h2>Connect Phone</h2>
      <p style={{ color: "#999" }}>
        Scan this QR code with your phone camera to stream music on your mobile device.
      </p>

      {qrData ? (
        <>
          <img className="qr-image" src={qrData.qrDataUrl} alt="QR Code" />
          <div className="connect-url">
            <a href={qrData.url} target="_blank" rel="noreferrer">
              {qrData.url}
            </a>
          </div>
        </>
      ) : (
        <p className="empty-state">Loading QR Code...</p>
      )}
    </div>
  );
}
