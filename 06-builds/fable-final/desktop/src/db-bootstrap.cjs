// === What's in this file ===
// Gets the local database ready before the embedded server starts, so the very
// first page load already has tables (and demo data on a fresh install).
//
// bootstrapLocalDb({ dbFile, migrationsFolder, seedDb }) -- makes the data folder,
//   copies a bundled pre-seeded database on the very first run (so a brand-new
//   install opens to a working demo board instead of a blank screen), then applies
//   any pending SQL migrations. Migrations are idempotent: a database restored from
//   the seed already has them recorded, so this just becomes a no-op there. Returns
//   the file: URL the server should use.

const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@libsql/client");
const { drizzle } = require("drizzle-orm/libsql");
const { migrate } = require("drizzle-orm/libsql/migrator");

async function bootstrapLocalDb({ dbFile, migrationsFolder, seedDb }) {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });

  const freshInstall = !fs.existsSync(dbFile);
  if (freshInstall && seedDb && fs.existsSync(seedDb)) {
    fs.copyFileSync(seedDb, dbFile);
  }

  const client = createClient({ url: `file:${dbFile}` });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder });
  client.close();

  return `file:${dbFile}`;
}

module.exports = { bootstrapLocalDb };
