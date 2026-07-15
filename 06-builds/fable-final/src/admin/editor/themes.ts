// P6.14 — display-board themes (8 built-ins + custom slots in localStorage).

export interface BoardTheme {
  id: string;
  label: string;
  backgroundColor: string;
  backgroundMode: "solid" | "gradient";
  backgroundGradient?: string;
  foreColor: string;
  accent: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  { id: "midnight", label: "Midnight", backgroundColor: "#0f172a", backgroundMode: "solid", foreColor: "#f8fafc", accent: "#38bdf8" },
  { id: "parchment", label: "Parchment", backgroundColor: "#f5f0e6", backgroundMode: "solid", foreColor: "#1c1917", accent: "#b45309" },
  { id: "forest", label: "Forest", backgroundColor: "#14532d", backgroundMode: "solid", foreColor: "#ecfdf5", accent: "#86efac" },
  { id: "ocean", label: "Ocean", backgroundColor: "#0c4a6e", backgroundMode: "solid", foreColor: "#e0f2fe", accent: "#7dd3fc" },
  { id: "sunset", label: "Sunset", backgroundColor: "#7c2d12", backgroundMode: "gradient", backgroundGradient: "linear-gradient(135deg,#7c2d12,#c2410c)", foreColor: "#fff7ed", accent: "#fdba74" },
  { id: "slate", label: "Slate", backgroundColor: "#1e293b", backgroundMode: "solid", foreColor: "#e2e8f0", accent: "#94a3b8" },
  { id: "royal", label: "Royal", backgroundColor: "#1e1b4b", backgroundMode: "solid", foreColor: "#eef2ff", accent: "#a5b4fc" },
  { id: "clean", label: "Clean white", backgroundColor: "#ffffff", backgroundMode: "solid", foreColor: "#0f172a", accent: "#2563eb" },
];

const CUSTOM_KEY = "menez-board-custom-themes";

export function loadCustomThemes(): BoardTheme[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BoardTheme[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomTheme(theme: BoardTheme) {
  const all = loadCustomThemes().filter((t) => t.id !== theme.id);
  all.push(theme);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(all));
}

export function deleteCustomTheme(id: string) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(loadCustomThemes().filter((t) => t.id !== id)));
}

/** Rough luminance from hex (#rgb / #rrggbb) for auto-contrast (P6.8). */
export function contrastText(bg: string): string {
  const hex = bg.replace("#", "");
  if (hex.length !== 3 && hex.length !== 6) return "#ffffff";
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#0f172a" : "#f8fafc";
}

/** Sample dominant colors from an image data URL (simple canvas downsample). */
export async function paletteFromImage(dataUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 32;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve([]);
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      const buckets = new Map<string, number>();
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i]! & 0xf0;
        const g = data[i + 1]! & 0xf0;
        const b = data[i + 2]! & 0xf0;
        const key = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
      resolve(
        [...buckets.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([c]) => c),
      );
    };
    img.onerror = () => resolve([]);
    img.src = dataUrl;
  });
}
