// Electron main — R10 / DK1–DK26 / G1–G13 for rebuild-a (self-contained paths).
// Modes: local | display | hybrid. Docker documented separately (DK2).

const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  clipboard,
  shell,
  dialog,
  nativeImage,
  ipcMain,
} = require("electron");
const { findFreePort, lanAddress, startServer, waitForHealth } = require("./server.cjs");
const { bootstrapLocalDb } = require("./db-bootstrap.cjs");
const { loadConfig, saveConfig, configPath } = require("./config.cjs");
const { parseBzs } = require("./beezee.cjs");

const TRAY_ICON = nativeImage.createFromDataURL(
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/PLvAAAAAElFTkSuQmCC",
);

let serverChild = null;
let displayWindow = null;
let adminWindow = null;
let tray = null;
let runtime = { mode: "local", port: null, lanUrl: null, localUrl: null, dbFile: null };
const syncListeners = new Set();

function resolvePaths() {
  const webRoot = path.join(__dirname, "..", "..");
  if (app.isPackaged) {
    const res = process.resourcesPath;
    const serverRoot = path.join(res, "app-server");
    return {
      serverJs: path.join(serverRoot, "server.js"),
      serverCwd: serverRoot,
      migrationsFolder: path.join(res, "drizzle"),
      seedDb: path.join(res, "seed", "demo.db"),
      preload: path.join(__dirname, "preload.cjs"),
    };
  }
  const standalone = path.join(webRoot, ".next", "standalone");
  return {
    serverJs: path.join(standalone, "server.js"),
    serverCwd: standalone,
    migrationsFolder: path.join(webRoot, "drizzle"),
    seedDb: process.env.MENEZMANIM_SEED_DB || path.join(__dirname, "..", "resources", "seed", "demo.db"),
    preload: path.join(__dirname, "preload.cjs"),
  };
}

function emitSyncUpdate(payload) {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send("sync-update", payload);
  }
  for (const fn of syncListeners) fn(payload);
}

function wireIpc() {
  ipcMain.handle("getConfig", () => loadConfig(app));
  ipcMain.handle("saveConfig", (_e, patch) => {
    const next = saveConfig(app, patch || {});
    if (typeof patch?.autoStart === "boolean") {
      app.setLoginItemSettings({ openAtLogin: patch.autoStart, path: process.execPath });
    }
    return next;
  });
  ipcMain.handle("getDbPath", () => runtime.dbFile || path.join(app.getPath("userData"), "data", "zmanim.db"));
  ipcMain.handle("getMode", () => runtime.mode);
  ipcMain.handle("getLanUrl", () => runtime.lanUrl);
  ipcMain.on("onSyncUpdate-subscribe", (event) => {
    const id = event.sender.id;
    const listener = (payload) => {
      if (!event.sender.isDestroyed()) event.sender.send("sync-update", payload);
    };
    syncListeners.add(listener);
    event.sender.once("destroyed", () => syncListeners.delete(listener));
    void id;
  });
}

async function launchLocal(config) {
  const paths = resolvePaths();
  const dbFile = process.env.MENEZMANIM_DB_FILE || path.join(app.getPath("userData"), "data", "zmanim.db");
  runtime.dbFile = dbFile;
  const databaseUrl = await bootstrapLocalDb({
    dbFile,
    migrationsFolder: paths.migrationsFolder,
    seedDb: paths.seedDb,
  });

  const port = await findFreePort();
  const serveLan = config.serveLan !== false;
  serverChild = startServer({
    serverJs: paths.serverJs,
    cwd: paths.serverCwd,
    port,
    host: serveLan ? "0.0.0.0" : "127.0.0.1",
    env: {
      DATABASE_URL: databaseUrl,
      AUTH_MODE: "local",
      MENEZMANIM_LAN_GUARD: serveLan ? "1" : "0",
    },
  });
  await waitForHealth(port);

  const ip = serveLan ? lanAddress() : null;
  runtime = {
    ...runtime,
    mode: config.mode,
    port,
    localUrl: `http://127.0.0.1:${port}`,
    lanUrl: ip ? `http://${ip}:${port}` : null,
  };

  await logBoardStatus(port);
  if (process.env.MENEZMANIM_SPIKE_EXIT === "1") {
    setTimeout(() => app.quit(), 1500);
    return;
  }
  if (config.mode === "hybrid") startSyncLoop(config);
  createDisplayWindow(`${runtime.localUrl}/show`, config.kiosk, paths.preload);
}

let syncCursor = 0;
function startSyncLoop(config) {
  const cloudUrl = (config.cloudUrl || "").trim();
  const token = (config.deviceToken || "").trim();
  if (!cloudUrl || !token) {
    console.log("[sync] hybrid mode but cloudUrl/deviceToken not set — skipping sync.");
    return;
  }
  const everyMs = Math.max(15, Number(config.syncIntervalSeconds) || 60) * 1000;
  const tick = async () => {
    try {
      const res = await fetch(`${runtime.localUrl}/api/sync/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cloudUrl, token, since: syncCursor }),
      });
      const data = await res.json();
      if (res.ok) {
        syncCursor = data.cursor || syncCursor;
        const payload = {
          kind: "cycle",
          pulled: data.pulledApplied,
          pushed: data.pushedApplied,
          conflicts: data.conflicts,
          cursor: syncCursor,
        };
        console.log(`[sync] pulled ${data.pulledApplied}, pushed ${data.pushedApplied}, conflicts ${data.conflicts}`);
        emitSyncUpdate(payload);
      } else {
        emitSyncUpdate({ kind: "error", error: data.error || String(res.status) });
        console.log(`[sync] failed: ${data.error || res.status}`);
      }
    } catch (err) {
      emitSyncUpdate({ kind: "error", error: err && err.message ? err.message : String(err) });
      console.log(`[sync] error: ${err && err.message ? err.message : err}`);
    }
  };
  setTimeout(tick, 3000);
  setInterval(tick, everyMs);
}

function launchDisplay(config) {
  const url = (config.remoteUrl || "").trim();
  runtime = { mode: "display", port: null, localUrl: null, lanUrl: null, dbFile: null };
  if (!url) {
    createDisplayWindow(`data:text/html,${encodeURIComponent(NO_REMOTE_HTML)}`, false);
    return;
  }
  createDisplayWindow(url, config.kiosk);
}

const NO_REMOTE_HTML = `<!doctype html><meta charset=utf-8><body style="font-family:system-ui;background:#0f172a;color:#e2e8f0;display:grid;place-items:center;height:100vh;margin:0;text-align:center"><div><h1>Display mode</h1><p>Set a board URL in the tray menu → Settings, or edit config.json.</p></div></body>`;

function createDisplayWindow(url, kiosk, preload) {
  displayWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    backgroundColor: "#0f172a",
    title: "MenEZmanim Display",
    fullscreen: Boolean(kiosk),
    frame: !kiosk,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preload || resolvePaths().preload,
    },
  });
  displayWindow.loadURL(url);
  displayWindow.on("closed", () => {
    displayWindow = null;
  });
}

function openAdminWindow() {
  if (!runtime.localUrl) return;
  if (adminWindow) {
    if (adminWindow.isMinimized()) adminWindow.restore();
    adminWindow.focus();
    return;
  }
  adminWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "#0f172a",
    title: "MenEZmanim Admin",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: resolvePaths().preload,
    },
  });
  adminWindow.loadURL(`${runtime.localUrl}/admin`);
  adminWindow.on("closed", () => {
    adminWindow = null;
  });
}

function switchMode(mode) {
  saveConfig(app, { mode });
  app.relaunch();
  app.exit(0);
}

async function importBeezeeFile() {
  const picked = await dialog.showOpenDialog({
    title: "Open a BeeZee file (preview)",
    filters: [
      { name: "BeeZee", extensions: ["bzs", "txt"] },
      { name: "All files", extensions: ["*"] },
    ],
    properties: ["openFile"],
  });
  if (picked.canceled || picked.filePaths.length === 0) return;
  try {
    const content = fs.readFileSync(picked.filePaths[0], "utf-8");
    const { zmanimDefs, toladotEntries } = parseBzs(content);
    const sample = zmanimDefs
      .slice(0, 5)
      .map((d) => `  ${d.index}: ${d.englishLabel || d.hebrewLabel || "(no label)"} @ ${d.degrees}°`)
      .join("\n");
    await dialog.showMessageBox({
      type: "info",
      title: "BeeZee preview",
      message: `Parsed ${zmanimDefs.length} zmanim definitions and ${toladotEntries.length} derived entries.`,
      detail: `${sample}\n\nPreview only — full DB import uses Admin → Import/Export (F9).`,
    });
  } catch (err) {
    await dialog.showMessageBox({
      type: "error",
      title: "Couldn't read that file",
      message: String(err && err.message ? err.message : err),
    });
  }
}

function openConfigInEditor() {
  const file = configPath(app);
  if (!fs.existsSync(file)) saveConfig(app, {});
  shell.openPath(file);
}

function buildTray(config) {
  tray = new Tray(TRAY_ICON);
  tray.setToolTip("MenEZmanim");
  const isLocal = runtime.mode === "local" || runtime.mode === "hybrid";

  const template = [
    {
      label: "Open display",
      click: () => {
        if (displayWindow) displayWindow.focus();
        else
          createDisplayWindow(
            runtime.localUrl ? `${runtime.localUrl}/show` : `data:text/html,${encodeURIComponent(NO_REMOTE_HTML)}`,
            config.kiosk,
          );
      },
    },
  ];
  if (isLocal) {
    template.push({ label: "Open admin", click: openAdminWindow });
    if (runtime.lanUrl) {
      template.push({
        label: `Copy LAN address (${runtime.lanUrl})`,
        click: () => clipboard.writeText(`${runtime.lanUrl}/show`),
      });
      template.push({
        label: "Open LAN board in browser",
        click: () => shell.openExternal(`${runtime.lanUrl}/show`),
      });
      template.push({
        label: "Open LAN mobile in browser",
        click: () => shell.openExternal(`${runtime.lanUrl}/mobile?org=demo`),
      });
    }
    template.push({ type: "separator" });
    template.push({ label: "Import BeeZee file… (preview)", click: importBeezeeFile });
  }
  template.push({ type: "separator" });
  template.push({
    label: "Mode",
    submenu: [
      { label: "Local (run here + serve LAN)", type: "radio", checked: runtime.mode === "local", click: () => switchMode("local") },
      { label: "Display only (remote board)", type: "radio", checked: runtime.mode === "display", click: () => switchMode("display") },
      { label: "Hybrid (local + cloud sync)", type: "radio", checked: runtime.mode === "hybrid", click: () => switchMode("hybrid") },
    ],
  });
  template.push({
    label: "Kiosk fullscreen",
    type: "checkbox",
    checked: Boolean(config.kiosk),
    click: (item) => {
      saveConfig(app, { kiosk: item.checked });
      if (displayWindow) {
        displayWindow.setFullScreen(item.checked);
        displayWindow.setMenuBarVisibility(!item.checked);
      }
    },
  });
  template.push({
    label: "Start with Windows",
    type: "checkbox",
    checked: Boolean(config.autoStart),
    click: (item) => {
      saveConfig(app, { autoStart: item.checked });
      app.setLoginItemSettings({ openAtLogin: item.checked, path: process.execPath });
    },
  });
  template.push({ label: "Edit config.json…", click: openConfigInEditor });
  template.push({ type: "separator" });
  template.push({ label: "Reload display", click: () => displayWindow && displayWindow.reload() });
  template.push({ label: "Quit", click: () => app.quit() });

  tray.setContextMenu(Menu.buildFromTemplate(template));
}

function logBoardStatus(port) {
  return new Promise((resolve) => {
    http
      .get({ host: "127.0.0.1", port, path: "/show", timeout: 5000 }, (res) => {
        let bytes = 0;
        res.on("data", (c) => (bytes += c.length));
        res.on("end", () => {
          console.log(`[desktop] GET /show -> ${res.statusCode}, ${bytes} bytes`);
          resolve();
        });
      })
      .on("error", (e) => {
        console.log(`[desktop] GET /show failed: ${e.message}`);
        resolve();
      });
  });
}

async function launch() {
  wireIpc();
  const config = loadConfig(app);
  if (config.autoStart) {
    app.setLoginItemSettings({ openAtLogin: true, path: process.execPath });
  }
  console.log(`[desktop] mode=${config.mode} serveLan=${config.serveLan !== false} config=${configPath(app)}`);
  if (config.mode === "display") {
    launchDisplay(config);
  } else {
    await launchLocal(config);
  }
  if (process.env.MENEZMANIM_SPIKE_EXIT === "1") return;
  buildTray(config);
  globalShortcut.register("CommandOrControl+Shift+A", openAdminWindow);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(launch).catch((err) => {
    console.error("[main] launch failed:", err);
    app.quit();
  });

  app.on("second-instance", () => {
    const win = displayWindow || adminWindow;
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.on("window-all-closed", () => {
    // G12 — stay alive in the tray on Win/Linux so the display can reopen.
    if (!tray) app.quit();
  });

  app.on("before-quit", () => {
    globalShortcut.unregisterAll();
    if (serverChild) serverChild.kill();
  });
}
