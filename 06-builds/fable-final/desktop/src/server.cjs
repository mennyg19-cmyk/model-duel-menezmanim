// === What's in this file ===
// Boots the web app's Next "standalone" server as a child process and waits
// until it's actually answering before anyone points a window at it.
//
// findFreePort() -- asks the OS for an unused port so two copies of the app (or
//   anything else on the machine) never fight over the same port.
// lanAddress() -- this machine's LAN IPv4 (e.g. 192.168.1.5), so we can show the
//   URL phones on the same network use, or null if there's no LAN.
// startServer({ serverJs, cwd, port, host, env }) -- launches server.js using
//   Electron's own binary in plain-Node mode (ELECTRON_RUN_AS_NODE). That means the
//   native libSQL addon loads with no electron-rebuild step, because it's a real
//   Node process. `host` is 127.0.0.1 (local only) or 0.0.0.0 (also serve the LAN).
// waitForHealth(port, timeoutMs) -- polls http://127.0.0.1:port/ until it returns
//   any HTTP response (the server is up) or the timeout is hit. We show the window
//   only after this resolves, so users never see a connection-refused flash.

const { spawn } = require("node:child_process");
const net = require("node:net");
const http = require("node:http");
const os = require("node:os");

function findFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

function lanAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const iface of nets[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return null;
}

function startServer({ serverJs, cwd, port, host, env }) {
  const child = spawn(process.execPath, [serverJs], {
    cwd,
    env: {
      ...process.env,
      ...env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(port),
      HOSTNAME: host || "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (b) => process.stdout.write(`[server] ${b}`));
  child.stderr.on("data", (b) => process.stderr.write(`[server] ${b}`));
  return child;
}

function waitForHealth(port, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get({ host: "127.0.0.1", port, path: "/", timeout: 2000 }, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", retry);
      req.on("timeout", () => {
        req.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() > deadline) {
        reject(new Error(`embedded server did not become healthy within ${timeoutMs}ms`));
        return;
      }
      setTimeout(tryOnce, 250);
    };
    tryOnce();
  });
}

module.exports = { findFreePort, lanAddress, startServer, waitForHealth };
