const os = require("node:os");

function getLanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((address) => address && address.family === "IPv4" && !address.internal)
    .map((address) => address.address);
}

function getLanUrl(port) {
  const address = getLanAddresses()[0] ?? "127.0.0.1";
  return `http://${address}:${port}`;
}

module.exports = { getLanAddresses, getLanUrl };
