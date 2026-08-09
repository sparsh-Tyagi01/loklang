import { useEffect, useState } from "react";

export default function Connect() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    fetch("/api/qr/url")
      .then((res) => res.json())
      .then((data) => setUrl(data.url));
  }, []);

  return (
    <div className="detail-page connect-page">
      <h2>Connect from another device</h2>
      <p className="grid-subtitle">
        Scan this QR code with your phone (same WiFi network), or visit the link below.
      </p>

      <img className="qr-image" src="/api/qr" alt="QR code to connect" />

      {url && (
        <p className="connect-url">
          <a href={url}>{url}</a>
        </p>
      )}
    </div>
  );
}