const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("menez", {
  getConfig: () => ipcRenderer.invoke("desktop:get-config"),
  saveConfig: (config) => ipcRenderer.invoke("desktop:save-config", config),
  getDbPath: () => ipcRenderer.invoke("desktop:get-db-path"),
  onSyncUpdate: (listener) => {
    const handler = (_event, update) => listener(update);
    ipcRenderer.on("desktop:sync-update", handler);
    return () => ipcRenderer.removeListener("desktop:sync-update", handler);
  },
  getMode: () => ipcRenderer.invoke("desktop:get-mode"),
  getLanUrl: () => ipcRenderer.invoke("desktop:get-lan-url"),
  importBeeZee: () => ipcRenderer.invoke("desktop:import-beezee"),
  openAdmin: () => ipcRenderer.invoke("desktop:open-admin"),
  restart: () => ipcRenderer.invoke("desktop:restart"),
});
