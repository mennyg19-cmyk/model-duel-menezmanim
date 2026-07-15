const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

async function waitForServer(origin, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/api/zmanim?org=demo`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Embedded web server did not start: ${origin}`);
}

async function startWebServer({ app, dbPath, port, externalOrigin, logPath }) {
  if (externalOrigin) {
    await waitForServer(externalOrigin);
    return { origin: externalOrigin, close: async () => {} };
  }

  const webDirectory = app.isPackaged
    ? path.join(process.resourcesPath, "web")
    : path.resolve(__dirname, "..", "..", ".next", "standalone");
  const serverPath = path.join(webDirectory, "server.js");
  const origin = `http://127.0.0.1:${port}`;
  const log = fs.openSync(logPath, "a");
  const child = spawn(process.execPath, [serverPath], {
    cwd: webDirectory,
    windowsHide: true,
    stdio: ["ignore", log, log],
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      AUTH_MODE: "desktop",
      DATABASE_URL: `file:${dbPath.replace(/\\/g, "/")}`,
      HOSTNAME: "127.0.0.1",
      NODE_PATH: path.join(webDirectory, "modules"),
      PORT: String(port),
    },
  });
  try {
    await waitForServer(origin);
  } catch (error) {
    child.kill();
    fs.closeSync(log);
    throw error;
  }
  return {
    origin,
    close: async () => {
      if (child.exitCode === null) child.kill();
      fs.closeSync(log);
    },
  };
}

module.exports = { startWebServer, waitForServer };
