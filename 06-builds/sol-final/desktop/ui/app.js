const fields = [
  "orgSlug",
  "screenId",
  "webPort",
  "lanPort",
  "remoteDisplayUrl",
  "cloudOrigin",
  "cloudOrgId",
  "screenCredential",
];

function setMessage(message, isError = false) {
  const target = document.querySelector("#message");
  target.textContent = message;
  target.classList.toggle("message-error", isError);
}

function selectedMode() {
  return document.querySelector('input[name="mode"]:checked')?.value || "fully-local";
}

async function load() {
  const [config, dbPath, mode, lanUrl] = await Promise.all([
    window.menez.getConfig(),
    window.menez.getDbPath(),
    window.menez.getMode(),
    window.menez.getLanUrl(),
  ]);
  document.querySelector(`input[name="mode"][value="${config.mode}"]`).checked = true;
  for (const field of fields) document.querySelector(`#${field}`).value = config[field] ?? "";
  document.querySelector("#kiosk").checked = config.kiosk;
  document.querySelector("#autoStart").checked = config.autoStart;
  document.querySelector("#dbPath").textContent = dbPath;
  document.querySelector("#modeBadge").textContent = mode;
  const lanLink = document.querySelector("#lanUrl");
  lanLink.textContent = lanUrl || "Display-only mode";
  if (lanUrl) lanLink.href = lanUrl;
}

document.querySelector("#save").addEventListener("click", async () => {
  const current = await window.menez.getConfig();
  const next = { ...current, mode: selectedMode() };
  for (const field of fields) next[field] = document.querySelector(`#${field}`).value.trim();
  next.webPort = Number(next.webPort);
  next.lanPort = Number(next.lanPort);
  next.kiosk = document.querySelector("#kiosk").checked;
  next.autoStart = document.querySelector("#autoStart").checked;
  await window.menez.saveConfig(next);
  setMessage("Settings saved. Restart to apply the selected mode.");
});

document.querySelector("#restart").addEventListener("click", () => window.menez.restart());
document.querySelector("#openAdmin").addEventListener("click", () => window.menez.openAdmin());
document.querySelector("#importBeeZee").addEventListener("click", async () => {
  setMessage("Reading BeeZee files…");
  try {
    const summary = await window.menez.importBeeZee();
    setMessage(
      summary
        ? `Imported ${summary.fileCount} files${summary.applied ? `; wrote ${summary.applied.written} records` : ""}.`
        : "Import cancelled.",
    );
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "BeeZee import failed.", true);
  }
});

window.menez.onSyncUpdate((update) => {
  const target = document.querySelector("#syncStatus");
  target.textContent =
    update.state === "idle"
      ? `Synced ${update.pushed} up / ${update.pulled} down`
      : update.error || update.state;
});

void load().catch((error) => setMessage(error.message, true));
