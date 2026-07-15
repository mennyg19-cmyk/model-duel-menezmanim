const path = require("node:path");
const express = require("express");
const { readAnnouncements, readSchedules } = require("./db.cjs");

async function createLocalApi({
  dbPath,
  webOrigin,
  port = 3001,
  host = "0.0.0.0",
  mobileDirectory = path.join(__dirname, "..", "mobile"),
}) {
  const api = express();
  api.disable("x-powered-by");
  api.use(express.json({ limit: "256kb" }));
  api.use((request, response, next) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Cache-Control", "no-store");
    next();
  });

  api.get("/health", (_request, response) => {
    response.json({ ok: true, database: path.basename(dbPath), webOrigin });
  });
  api.get("/api/schedule", (request, response) => {
    response.json({ schedules: readSchedules(dbPath, String(request.query.org || "demo")) });
  });
  api.get("/api/announcements", (request, response) => {
    response.json({ announcements: readAnnouncements(dbPath, String(request.query.org || "demo")) });
  });
  api.get("/api/zmanim/:date", async (request, response) => {
    const org = String(request.query.org || "demo");
    const url = `${webOrigin}/api/zmanim?org=${encodeURIComponent(org)}&date=${encodeURIComponent(request.params.date)}`;
    try {
      const upstream = await fetch(url);
      const payload = await upstream.json();
      response.status(upstream.status).json(payload);
    } catch {
      response.status(503).json({ error: "Local zmanim engine is not ready" });
    }
  });

  api.use("/mobile", express.static(mobileDirectory, { index: "index.html" }));
  api.get("/", (_request, response) => response.redirect("/mobile/"));

  const server = await new Promise((resolve, reject) => {
    const listening = api.listen(port, host, () => resolve(listening));
    listening.once("error", reject);
  });
  return {
    port,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

module.exports = { createLocalApi };
