// DK9 — preload bridge: getConfig / saveConfig / getDbPath / getMode / onSyncUpdate / getLanUrl

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("menezDesktop", {
  getConfig: () => ipcRenderer.invoke("getConfig"),
  saveConfig: (patch) => ipcRenderer.invoke("saveConfig", patch),
  getDbPath: () => ipcRenderer.invoke("getDbPath"),
  getMode: () => ipcRenderer.invoke("getMode"),
  getLanUrl: () => ipcRenderer.invoke("getLanUrl"),
  onSyncUpdate: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on("sync-update", handler);
    ipcRenderer.send("onSyncUpdate-subscribe");
    return () => ipcRenderer.removeListener("sync-update", handler);
  },
});
