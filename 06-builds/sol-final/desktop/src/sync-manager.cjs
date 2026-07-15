const { openDatabase, saveSyncEntries } = require("./db.cjs");

class SyncManager {
  constructor({ config, dbPath, onUpdate, intervalMs = 30_000 }) {
    this.config = config;
    this.dbPath = dbPath;
    this.onUpdate = onUpdate;
    this.intervalMs = intervalMs;
    this.cursor = null;
    this.timer = null;
    this.running = false;
  }

  start() {
    if (this.timer || this.config.mode !== "hybrid") return;
    void this.runNow();
    this.timer = setInterval(() => void this.runNow(), this.intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async runNow() {
    if (this.running || !this.isConfigured()) return;
    this.running = true;
    this.onUpdate({ state: "syncing" });
    try {
      const pushed = await this.pushLocal();
      const pulled = await this.pullCloud();
      this.onUpdate({
        state: "idle",
        pushed,
        pulled,
        lastSyncAt: new Date().toISOString(),
      });
    } catch (error) {
      this.onUpdate({
        state: "error",
        error: error instanceof Error ? error.message : "Desktop sync failed",
      });
    } finally {
      this.running = false;
    }
  }

  isConfigured() {
    return Boolean(
      this.config.cloudOrigin &&
        this.config.cloudOrgId &&
        this.config.screenCredential &&
        this.config.screenId,
    );
  }

  headers(contentType = false) {
    return {
      ...(contentType ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${this.config.screenCredential}`,
      "X-Screen-Id": this.config.screenId,
    };
  }

  async pushLocal() {
    const db = openDatabase(this.dbPath);
    let rows;
    try {
      rows = db
        .prepare(
          'SELECT id, tableName, recordId, operation, data, timestamp, clientTimestamp FROM "SyncLog" WHERE synced = 0 AND operation != ? ORDER BY timestamp LIMIT 100',
        )
        .all("conflict");
    } finally {
      db.close();
    }
    if (!rows.length) return 0;

    const response = await fetch(`${this.config.cloudOrigin}/api/sync/push`, {
      method: "POST",
      headers: this.headers(true),
      body: JSON.stringify({
        orgId: this.config.cloudOrgId,
        strategy: "last-write-wins",
        changes: rows.map((row) => ({
          tableName: row.tableName,
          recordId: row.recordId,
          operation: row.operation === "delete" ? "delete" : "upsert",
          data: JSON.parse(row.data || "null"),
          timestamp: new Date(row.clientTimestamp || row.timestamp).toISOString(),
          baseTimestamp: null,
        })),
      }),
    });
    if (!response.ok) throw new Error(`Cloud sync push failed: HTTP ${response.status}`);

    const updateDb = openDatabase(this.dbPath);
    try {
      const mark = updateDb.prepare('UPDATE "SyncLog" SET synced = 1 WHERE id = ?');
      for (const row of rows) mark.run(row.id);
    } finally {
      updateDb.close();
    }
    return rows.length;
  }

  async pullCloud() {
    const query = new URLSearchParams({ orgId: this.config.cloudOrgId, limit: "100" });
    if (this.cursor) query.set("cursor", this.cursor);
    const response = await fetch(`${this.config.cloudOrigin}/api/sync/pull?${query}`, {
      headers: this.headers(),
    });
    if (!response.ok) throw new Error(`Cloud sync pull failed: HTTP ${response.status}`);
    const payload = await response.json();
    this.cursor = payload.cursor;
    saveSyncEntries(this.dbPath, payload.changes);
    return payload.changes.length;
  }
}

module.exports = { SyncManager };
