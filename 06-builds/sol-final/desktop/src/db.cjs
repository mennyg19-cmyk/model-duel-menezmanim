const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

function ensureLocalDatabase(userDataPath, seedPath) {
  const dataDirectory = path.join(userDataPath, "data");
  const dbPath = path.join(dataDirectory, "zmanim.db");
  fs.mkdirSync(dataDirectory, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    if (!fs.existsSync(seedPath)) throw new Error(`Seed database not found: ${seedPath}`);
    fs.copyFileSync(seedPath, dbPath);
  }
  const db = openDatabase(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS DesktopImport (
      id TEXT PRIMARY KEY,
      sourcePath TEXT NOT NULL,
      summary TEXT NOT NULL,
      importedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS DesktopSyncInbox (
      id TEXT PRIMARY KEY,
      orgId TEXT NOT NULL,
      tableName TEXT NOT NULL,
      recordId TEXT NOT NULL,
      operation TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);
  db.close();
  return dbPath;
}

function openDatabase(dbPath) {
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");
  return db;
}

function getOrganizationId(db, slug = "demo") {
  return db.prepare('SELECT id FROM "Organization" WHERE slug = ?').get(slug)?.id ?? null;
}

function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mergeInbox(db, tableName, rows) {
  const records = new Map(rows.map((row) => [row.id, row]));
  const entries = db
    .prepare(
      "SELECT recordId, operation, data FROM DesktopSyncInbox WHERE tableName = ? ORDER BY timestamp, id",
    )
    .all(tableName);
  for (const entry of entries) {
    if (entry.operation === "delete") {
      records.delete(entry.recordId);
      continue;
    }
    if (entry.operation === "conflict") continue;
    const payload = parseJson(entry.data, {});
    records.set(entry.recordId, { ...(records.get(entry.recordId) || { id: entry.recordId }), ...payload });
  }
  return [...records.values()];
}

function readSchedules(dbPath, orgSlug = "demo") {
  const db = openDatabase(dbPath);
  try {
    const orgId = getOrganizationId(db, orgSlug);
    if (!orgId) return [];
    const rows = db
      .prepare(
        'SELECT id, name, hebrewName, type, baseZman, fixedTime, offset, room, dayOfWeekMask, details, isActive, sortOrder FROM "MinyanSchedule" WHERE orgId = ? ORDER BY sortOrder',
      )
      .all(orgId)
      .map((row) => ({ ...row, details: parseJson(row.details, {}) }));
    return mergeInbox(db, "MinyanSchedule", rows).sort(
      (left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0),
    );
  } finally {
    db.close();
  }
}

function readAnnouncements(dbPath, orgSlug = "demo") {
  const db = openDatabase(dbPath);
  try {
    const orgId = getOrganizationId(db, orgSlug);
    if (!orgId) return [];
    const rows = db
      .prepare(
        'SELECT id, title, titleHebrew, content, contentHebrew, priority, isActive, startDate, endDate FROM "Announcement" WHERE orgId = ? AND isActive = 1 ORDER BY priority DESC, createdAt DESC',
      )
      .all(orgId);
    return mergeInbox(db, "Announcement", rows)
      .filter((row) => row.isActive !== false && row.isActive !== 0)
      .sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0));
  } finally {
    db.close();
  }
}

function saveDesktopImport(dbPath, sourcePath, summary) {
  const db = openDatabase(dbPath);
  try {
    db.prepare(
      "INSERT INTO DesktopImport (id, sourcePath, summary, importedAt) VALUES (?, ?, ?, ?)",
    ).run(randomUUID(), sourcePath, JSON.stringify(summary), new Date().toISOString());
  } finally {
    db.close();
  }
}

function saveSyncEntries(dbPath, entries) {
  const db = openDatabase(dbPath);
  try {
    const insert = db.prepare(
      "INSERT OR REPLACE INTO DesktopSyncInbox (id, orgId, tableName, recordId, operation, data, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    db.exec("BEGIN");
    try {
      for (const entry of entries) {
        insert.run(
          entry.id,
          entry.orgId,
          entry.tableName,
          entry.recordId,
          entry.operation,
          JSON.stringify(entry.data ?? null),
          entry.timestamp,
        );
      }
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } finally {
    db.close();
  }
}

module.exports = {
  ensureLocalDatabase,
  getOrganizationId,
  openDatabase,
  readAnnouncements,
  readSchedules,
  saveDesktopImport,
  saveSyncEntries,
};
