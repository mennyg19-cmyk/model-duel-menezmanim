process.env.PORT ??= "3102";
process.env.HOSTNAME ??= "127.0.0.1";
await import("../.next/standalone/server.js");
