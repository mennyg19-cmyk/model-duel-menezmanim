#!/bin/sh
set -eu

npx prisma db push --skip-generate
node docker/seed-if-empty.mjs
exec node .next/standalone/server.js
