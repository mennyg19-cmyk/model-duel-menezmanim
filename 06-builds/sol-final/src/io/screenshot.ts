import { loadBoardData } from "@/server/board-repo";
import { buildDisplaySnapshot } from "@/core/board/snapshot";

/** F-SCREENSHOT / P10.4 — SVG capture of the current board (no headless browser). */
export async function buildBoardScreenshotSvg(orgSlug: string, screenId: string): Promise<string> {
  const data = await loadBoardData(orgSlug, screenId);
  if (!data) throw new Error("Board not found");
  const snapshot = buildDisplaySnapshot(data, { now: new Date() });
  const style = snapshot.style;
  if (!style) throw new Error("No active style");

  const objects = snapshot.objects
    .map((object) => {
      const x = object.position.x;
      const y = object.position.y;
      const w = object.position.width;
      const h = object.position.height;
      const label = escapeXml(object.name);
      return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(15,23,42,0.35)" stroke="#72d8ad" stroke-width="2"/>
  <text x="${x + 8}" y="${y + 24}" fill="#f8f4e8" font-size="18" font-family="Arial">${label}</text>
</g>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${style.canvasWidth}" height="${style.canvasHeight}" viewBox="0 0 ${style.canvasWidth} ${style.canvasHeight}">
  <rect width="100%" height="100%" fill="${escapeXml(style.backgroundColor)}"/>
  ${objects}
</svg>`;
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
