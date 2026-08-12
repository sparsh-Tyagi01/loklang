# Loklang

Loklang is a local audio streaming service that can be used to access audio files on the host from any device on the network.

## Features
- **Instant Local Audio Streaming**: Full support for HTTP range requests (`206 Partial Content`) for instant seeking.
- **Worker Thread Indexing**: Offloads ID3 metadata parsing to background worker threads for zero event loop lag.
- **Self-Healing Sync**: Real-time server-sent events (SSE) auto-sync when music files are uploaded or deleted.
- **Security Hardened**: Protected against path traversal attacks, DoS rate limits, and security headers.

---

## Development

Clone this repo:
```bash
git clone https://github.com/sparsh-Tyagi01/loklang.git
cd loklang
```

### 1. Run Backend API
```bash
cd backend
npm install
npm run dev
```

### 2. Run Frontend Client
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Building

Build the production frontend and backend assets:

```bash
# Build Frontend
cd frontend
npm run build

# Build Backend
cd ../backend
npm run build
```

---

## Running Production Server

Start the production Node.js server:

```bash
cd backend

# Push database schema
npx prisma db push

# Start server
npm start
```

Access the application at `http://localhost:8000` (or `http://YOUR_LOCAL_IP:8000` on your network).
