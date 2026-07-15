const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { app } = require("electron");
const { applyBzsThroughWeb, parseBeeZeePath } = require("../src/beezee.cjs");
const { loadConfig, saveConfig } = require("../src/config.cjs");
const { ensureLocalDatabase, openDatabase, saveDesktopImport } = require("../src/db.cjs");
const { createLocalApi } = require("../src/local-api.cjs");
const { runtimePlan } = require("../src/runtime-plan.cjs");
const { SyncManager } = require("../src/sync-manager.cjs");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  const root = path.resolve(__dirname, "..", "..");
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "menez-desktop-"));
  const dbPath = ensureLocalDatabase(temporary, path.join(root, "prisma", "dev.db"));

  const saved = saveConfig(temporary, {
    mode: "hybrid",
    orgSlug: "demo",
    screenId: "main",
    webPort: 3102,
    lanPort: 3001,
  });
  assert(loadConfig(temporary).mode === "hybrid" && saved.lanPort === 3001, "config persistence failed");
  const localPlan = runtimePlan({ ...saved, mode: "fully-local" }, "http://127.0.0.1:3102");
  const hybridPlan = runtimePlan(saved, "http://127.0.0.1:3102");
  const displayPlan = runtimePlan({
    ...saved,
    mode: "display-only",
    remoteDisplayUrl: "https://display.example/show/demo/main",
  });
  assert(localPlan.startsLocalServices && !localPlan.startsSync, "fully-local mode plan failed");
  assert(hybridPlan.startsLocalServices && hybridPlan.startsSync, "hybrid mode plan failed");
  assert(!displayPlan.startsLocalServices && displayPlan.displayUrl.includes("display.example"), "display-only plan failed");

  const input = path.join(temporary, "beezee");
  fs.mkdirSync(input);
  fs.writeFileSync(
    path.join(input, "Default.bzs"),
    '0,16.1,"05D0 05DC 05D5 05EA","41 6C 6F 73",24,0,"",""',
  );
  fs.writeFileSync(path.join(input, "Setting.txt"), "timezone=Asia/Jerusalem\n");
  fs.writeFileSync(path.join(input, "RulesGroupFile.dat"), "1,Weekday,mon-fri\n");
  fs.writeFileSync(path.join(input, "CalendarFile.dat"), "2460500,1\n");
  fs.writeFileSync(path.join(input, "Board.StyleConfig"), '{"background":"#123d34"}');
  fs.writeFileSync(path.join(input, "names.yrz"), "אברהם,Avraham,7,10,father\n");
  fs.writeFileSync(path.join(input, "notice.rtf"), "{\\rtf1 Welcome}");
  fs.writeFileSync(path.join(input, "background.png"), "image");
  fs.writeFileSync(path.join(input, "media.mp4"), "video");

  const imported = parseBeeZeePath(input);
  assert(Object.keys(imported.counts).length === 9, "nine BeeZee file families were not parsed");
  const applied = await applyBzsThroughWeb("http://127.0.0.1:3102", "demo", imported.bzsContent);
  assert(applied.written >= 1, "BZS definitions were not applied through the local web API");
  saveDesktopImport(dbPath, input, { counts: imported.counts, applied });

  const localApi = await createLocalApi({
    dbPath,
    webOrigin: "http://127.0.0.1:3102",
    port: 3001,
    mobileDirectory: path.join(__dirname, "..", "mobile"),
  });
  try {
    const [health, schedule, announcements, zmanim, mobile, manifest] = await Promise.all([
      fetch("http://127.0.0.1:3001/health"),
      fetch("http://127.0.0.1:3001/api/schedule"),
      fetch("http://127.0.0.1:3001/api/announcements"),
      fetch("http://127.0.0.1:3001/api/zmanim/2026-07-15"),
      fetch("http://127.0.0.1:3001/mobile/"),
      fetch("http://127.0.0.1:3001/mobile/manifest.webmanifest"),
    ]);
    const schedulePayload = await schedule.json();
    const announcementPayload = await announcements.json();
    assert(health.ok, "LAN health failed");
    assert(schedulePayload.schedules.length >= 5, "LAN schedule did not read SQLite");
    assert(announcementPayload.announcements.length >= 2, "LAN announcements did not read SQLite");
    assert(zmanim.ok, "LAN zmanim proxy failed");
    assert(mobile.ok && (await mobile.text()).includes("Today's minyanim"), "LAN mobile page failed");
    assert(manifest.ok, "LAN PWA manifest failed");

    const db = openDatabase(dbPath);
    const importCount = db.prepare("SELECT COUNT(*) AS count FROM DesktopImport").get().count;
    db.close();
    assert(Number(importCount) === 1, "BeeZee import result was not persisted");

    const sync = new SyncManager({
      config: { mode: "hybrid", cloudOrigin: "", cloudOrgId: "", screenCredential: "", screenId: "main" },
      dbPath,
      onUpdate: () => {},
    });
    sync.start();
    sync.stop();

    console.log(
      JSON.stringify({
        configMode: saved.mode,
        sqliteSchedules: schedulePayload.schedules.length,
        sqliteAnnouncements: announcementPayload.announcements.length,
        zmanimStatus: zmanim.status,
        pwaStatus: mobile.status,
        beeZeeFamilies: Object.keys(imported.counts).length,
        beeZeeWritten: applied.written,
        modesExercised: 3,
        syncManagerWired: true,
      }),
    );
  } finally {
    await localApi.close();
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

app.whenReady().then(run).then(() => app.quit()).catch((error) => {
  console.error(error);
  app.exit(1);
});
