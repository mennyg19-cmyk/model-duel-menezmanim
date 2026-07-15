// === What's in this file ===
// Reads and writes the desktop app's settings file (DK7) at
// <userData>/config.json. It's a tiny JSON file the user can also edit by hand.
//
// Settings:
//   mode      -- "local"   : run the whole app here on a local database (admin +
//                            display), and also serve the display/mobile views to
//                            the shul LAN.
//                "display" : just show a board from a remote URL (a hosted or other
//                            machine's /show); no local server, no database.
//                "hybrid"  : like local, plus cloud sync (wired in Phase H).
//   remoteUrl -- the board URL to show in "display" mode.
//   serveLan  -- in local/hybrid mode, bind the server to the LAN (default true) so
//                phones can open the congregant view; false = this machine only.
//   kiosk     -- open the display window full-screen with no frame (wall screens).
//   cloudUrl  -- (hybrid) the hosted site to sync with, e.g. https://app.example.com
//   deviceToken -- (hybrid) the pairing token from the cloud admin's Sync Devices page.
//   syncIntervalSeconds -- (hybrid) how often to sync (default 60).
//
// loadConfig() / saveConfig(patch) -- read the file (with defaults) / merge+write.

const fs = require("node:fs");
const path = require("node:path");

const DEFAULTS = {
  mode: "local",
  remoteUrl: "",
  serveLan: true,
  kiosk: false,
  autoStart: false,
  cloudUrl: "",
  deviceToken: "",
  syncIntervalSeconds: 60,
};

function configPath(app) {
  return path.join(app.getPath("userData"), "config.json");
}

function loadConfig(app) {
  try {
    const raw = fs.readFileSync(configPath(app), "utf-8");
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveConfig(app, patch) {
  const next = { ...loadConfig(app), ...patch };
  fs.mkdirSync(path.dirname(configPath(app)), { recursive: true });
  fs.writeFileSync(configPath(app), JSON.stringify(next, null, 2), "utf-8");
  return next;
}

module.exports = { DEFAULTS, loadConfig, saveConfig, configPath };
