const fs = require("node:fs");
const path = require("node:path");

const MODES = new Set(["fully-local", "hybrid", "display-only"]);

const DEFAULT_CONFIG = Object.freeze({
  mode: "fully-local",
  orgSlug: "demo",
  screenId: "main",
  webPort: 3102,
  lanPort: 3001,
  kiosk: true,
  autoStart: false,
  remoteDisplayUrl: "https://example.invalid/show/demo/main",
  cloudOrigin: "",
  cloudOrgId: "",
  screenCredential: "",
});

function configPath(userDataPath) {
  return path.join(userDataPath, "config.json");
}

function normalizeConfig(value) {
  const merged = { ...DEFAULT_CONFIG, ...(value && typeof value === "object" ? value : {}) };
  if (!MODES.has(merged.mode)) merged.mode = DEFAULT_CONFIG.mode;
  merged.webPort = Number.isInteger(Number(merged.webPort)) ? Number(merged.webPort) : 3102;
  merged.lanPort = Number.isInteger(Number(merged.lanPort)) ? Number(merged.lanPort) : 3001;
  merged.kiosk = Boolean(merged.kiosk);
  merged.autoStart = Boolean(merged.autoStart);
  return merged;
}

function loadConfig(userDataPath) {
  const file = configPath(userDataPath);
  if (!fs.existsSync(file)) return { ...DEFAULT_CONFIG };
  try {
    return normalizeConfig(JSON.parse(fs.readFileSync(file, "utf8")));
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(userDataPath, nextConfig) {
  const file = configPath(userDataPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const config = normalizeConfig(nextConfig);
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return config;
}

module.exports = { DEFAULT_CONFIG, MODES, loadConfig, saveConfig };
