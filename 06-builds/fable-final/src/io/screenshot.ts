import type { DisplaySnapshot } from "@/core/board/types";

/** F-SCREENSHOT / P10.4 — SVG capture of the active board (no canvas library). */
export function boardSnapshotToSvg(snapshot: DisplaySnapshot): string {
  const w = snapshot.style?.canvasWidth ?? 1920;
  const h = snapshot.style?.canvasHeight ?? 1080;
  const bg = snapshot.style?.backgroundColor ?? "#0f172a";
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const objects = snapshot.objects
    .map((o) => {
      const x = o.position.x;
      const y = o.position.y;
      const ow = o.position.width;
      const oh = o.position.height;
      const fill = o.font.color || "#fff";
      const label = escape(`${o.name} (${o.type})`);
      return `<g>
  <rect x="${x}" y="${y}" width="${ow}" height="${oh}" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" />
  <text x="${x + 8}" y="${y + Math.min(28, oh - 4)}" fill="${escape(fill)}" font-size="${Math.min(o.font.size || 18, 28)}" font-family="sans-serif">${label}</text>
</g>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="${escape(bg)}" />
  <text x="24" y="40" fill="#94a3b8" font-size="20" font-family="sans-serif">${escape(snapshot.org.name)} — board capture</text>
  ${objects}
</svg>`;
}
