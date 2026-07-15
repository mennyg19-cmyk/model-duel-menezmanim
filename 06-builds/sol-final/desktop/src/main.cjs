const fs = require("node:fs");
const path = require("node:path");
const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  clipboard,
  dialog,
  globalShortcut,
  ipcMain,
} = require("electron");
const { applyBzsThroughWeb, parseBeeZeePath } = require("./beezee.cjs");
const { loadConfig, saveConfig } = require("./config.cjs");
const { ensureLocalDatabase, saveDesktopImport } = require("./db.cjs");
const { createLocalApi } = require("./local-api.cjs");
const { getLanUrl } = require("./network.cjs");
const { startWebServer } = require("./next-server.cjs");
const { runtimePlan } = require("./runtime-plan.cjs");
const { SyncManager } = require("./sync-manager.cjs");

let adminWindow = null;
let displayWindow = null;
let tray = null;
let webRuntime = null;
let localApi = null;
let syncManager = null;
let config = null;
let dbPath = "";
let isQuitting = false;

const hasInstanceLock = app.requestSingleInstanceLock();
if (!hasInstanceLock) app.quit();

function settingsUrl() {
  return `file://${path.join(__dirname, "..", "ui", "index.html").replace(/\\/g, "/")}`;
}

function displayUrl() {
  return runtimePlan(config, webRuntime?.origin).displayUrl;
}

function createDisplayWindow() {
  displayWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: config.kiosk,
    kiosk: config.kiosk,
    frame: !config.kiosk,
    backgroundColor: "#08130f",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  void displayWindow.loadURL(displayUrl());
  displayWindow.on("closed", () => {
    displayWindow = null;
  });
}

function showDesktopSettings() {
  if (!adminWindow) return;
  void adminWindow.loadURL(settingsUrl());
  adminWindow.show();
  adminWindow.focus();
}

function openAdmin() {
  if (!adminWindow) return;
  void adminWindow.loadURL(runtimePlan(config, webRuntime?.origin).adminUrl);
  adminWindow.show();
  adminWindow.focus();
}

function createAdminWindow() {
  adminWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 620,
    title: "MenEZmanim Admin",
    backgroundColor: "#f3efe4",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  void adminWindow.loadURL(settingsUrl());
  adminWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      adminWindow.hide();
    }
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, "..", "build", "icon.png"));
  tray.setToolTip("MenEZmanim");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Show display",
        click: () => {
          if (!displayWindow) createDisplayWindow();
          displayWindow.show();
          displayWindow.focus();
        },
      },
      { label: "Desktop settings", click: showDesktopSettings },
      { label: "Open admin", click: openAdmin },
      {
        label: `Copy LAN URL (${getLanUrl(config.lanPort)})`,
        enabled: config.mode !== "display-only",
        click: () => clipboard.writeText(`${getLanUrl(config.lanPort)}/mobile/`),
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]),
  );
  tray.on("double-click", showDesktopSettings);
}

function emitSyncUpdate(update) {
  for (const window of [adminWindow, displayWindow]) {
    if (window && !window.isDestroyed()) window.webContents.send("desktop:sync-update", update);
  }
}

function registerIpc() {
  ipcMain.handle("desktop:get-config", () => config);
  ipcMain.handle("desktop:save-config", (_event, nextConfig) => {
    config = saveConfig(app.getPath("userData"), nextConfig);
    app.setLoginItemSettings({ openAtLogin: config.autoStart });
    return config;
  });
  ipcMain.handle("desktop:get-db-path", () => dbPath);
  ipcMain.handle("desktop:get-mode", () => config.mode);
  ipcMain.handle("desktop:get-lan-url", () =>
    config.mode === "display-only" ? null : `${getLanUrl(config.lanPort)}/mobile/`,
  );
  ipcMain.handle("desktop:open-admin", () => {
    openAdmin();
    return true;
  });
  ipcMain.handle("desktop:restart", () => {
    isQuitting = true;
    app.relaunch();
    app.quit();
    return true;
  });
  ipcMain.handle("desktop:import-beezee", async () => {
    const selection = await dialog.showOpenDialog(adminWindow, {
      title: "Choose BeeZee file or data folder",
      properties: ["openFile", "openDirectory"],
      filters: [
        {
          name: "BeeZee data",
          extensions: ["bzs", "txt", "dat", "StyleConfig", "yrz", "rtf", "bmp", "jpg", "png", "mp4"],
        },
      ],
    });
    if (selection.canceled || !selection.filePaths[0]) return null;
    const imported = parseBeeZeePath(selection.filePaths[0]);
    const applied =
      imported.bzsContent && webRuntime
        ? await applyBzsThroughWeb(webRuntime.origin, config.orgSlug, imported.bzsContent)
        : null;
    const summary = { counts: imported.counts, fileCount: imported.files.length, applied };
    saveDesktopImport(dbPath, imported.sourcePath, summary);
    return summary;
  });
}

async function startRuntime() {
  config = loadConfig(app.getPath("userData"));
  const seedPath = app.isPackaged
    ? path.join(process.resourcesPath, "seed", "zmanim.db")
    : path.resolve(__dirname, "..", "..", "prisma", "dev.db");
  dbPath = ensureLocalDatabase(app.getPath("userData"), seedPath);
  app.setLoginItemSettings({ openAtLogin: config.autoStart });

  if (runtimePlan(config).startsLocalServices) {
    webRuntime = await startWebServer({
      app,
      dbPath,
      port: config.webPort,
      externalOrigin: process.env.MENEZ_WEB_ORIGIN || null,
      logPath: path.join(app.getPath("userData"), "desktop.log"),
    });
    localApi = await createLocalApi({
      dbPath,
      webOrigin: webRuntime.origin,
      port: config.lanPort,
      mobileDirectory: path.join(__dirname, "..", "mobile"),
    });
  }

  registerIpc();
  createDisplayWindow();
  createAdminWindow();
  createTray();
  globalShortcut.register("CommandOrControl+Shift+A", showDesktopSettings);

  syncManager = new SyncManager({ config, dbPath, onUpdate: emitSyncUpdate });
  syncManager.start();
}

app.on("second-instance", showDesktopSettings);
app.on("window-all-closed", () => {
  // Tray owns lifetime on Windows/Linux.
});
app.on("before-quit", () => {
  isQuitting = true;
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  syncManager?.stop();
  void localApi?.close();
  void webRuntime?.close();
});

if (hasInstanceLock) {
  app.whenReady().then(startRuntime).catch((error) => {
    fs.appendFileSync(
      path.join(app.getPath("userData"), "desktop.log"),
      `${new Date().toISOString()} ${error instanceof Error ? error.stack : error}\n`,
      "utf8",
    );
    dialog.showErrorBox(
      "MenEZmanim could not start",
      error instanceof Error ? error.message : "Unknown desktop startup error",
    );
    app.quit();
  });
}
