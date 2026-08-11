import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/index.js";

describe("Express API Integration Tests", () => {
  it("GET /health/liveness should return 200 OK with uptime metrics", async () => {
    const res = await request(app).get("/health/liveness");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("uptime");
    expect(res.headers).toHaveProperty("x-request-id");
  });

  it("GET /health/readiness should return 200 OK with database connection status", async () => {
    const res = await request(app).get("/health/readiness");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ready");
    expect(res.body).toHaveProperty("database", "connected");
  });

  it("GET /api/songs should return 200 OK with array payload", async () => {
    const res = await request(app).get("/api/songs");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/stream/non-existent-id should return 404 Not Found", async () => {
    const res = await request(app).get("/api/stream/non-existent-id");
    expect(res.status).toBe(404);
  });
});
