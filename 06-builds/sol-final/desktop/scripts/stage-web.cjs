const fs = require("node:fs");
const path = require("node:path");

const desktopDirectory = path.resolve(__dirname, "..");
const rootDirectory = path.resolve(desktopDirectory, "..");
const source = path.join(rootDirectory, ".next", "standalone");
const target = path.join(desktopDirectory, ".web-runtime");

if (!fs.existsSync(path.join(source, "server.js"))) {
  throw new Error("Standalone web build missing. Run npm run build from the repository root.");
}

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true, dereference: true });
fs.renameSync(path.join(target, "node_modules"), path.join(target, "modules"));
fs.cpSync(path.join(rootDirectory, ".next", "static"), path.join(target, ".next", "static"), {
  recursive: true,
});
fs.cpSync(path.join(rootDirectory, "public"), path.join(target, "public"), { recursive: true });
console.log(`Staged desktop web runtime: ${target}`);
