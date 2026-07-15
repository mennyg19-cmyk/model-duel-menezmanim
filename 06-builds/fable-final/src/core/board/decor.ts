// === What's in this file ===
// The shared "looks" catalog for the board: gradient presets, texture presets, and
// frame presets, plus the helpers that turn a style's or an object's appearance into
// real CSS. Both the renderer (Board) and the editor's pickers read from here, so a
// texture looks the same while you pick it and once it's live.
//
// Textures and gradients are expressed as plain CSS (layered gradients) -- no image
// files to ship or break. Frames are CSS borders (an ornamental "double" border, a
// rounded modern border, a thin minimal border). The data model stores: a gradient's
// CSS in backgroundGradient, a texture's CSS in backgroundTexture, and a frame's id +
// thickness.
//
// GRADIENT_PRESETS / TEXTURE_PRESETS -- pickable {id,label,css}.
// FRAME_PRESETS -- pickable {id,label,kind}.
// frameStyle() -- a frame id + thickness -> border CSS.
// backgroundCss() -- a background mode + values -> a CSS `background` value (shared by
//   object appearance and the style canvas, tolerant of bare URLs from old data).
// scrollCss() -- appearance scrolling -> the inner animation CSS for a given box size.

export type GradientCategory = "warm" | "cool" | "neutral" | "vibrant";

export interface DecorPreset {
  id: string;
  label: string;
  css: string;
  category?: GradientCategory;
}

export const GRADIENT_CATEGORIES: { value: GradientCategory; label: string }[] = [
  { value: "warm", label: "Warm" },
  { value: "cool", label: "Cool" },
  { value: "neutral", label: "Neutral" },
  { value: "vibrant", label: "Vibrant" },
];

export const GRADIENT_PRESETS: DecorPreset[] = [
  { id: "sunset", label: "Sunset", css: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)", category: "warm" },
  { id: "ember", label: "Ember", css: "linear-gradient(135deg, #8e2de2 0%, #e94057 50%, #f27121 100%)", category: "warm" },
  { id: "gold", label: "Gold", css: "linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)", category: "warm" },
  { id: "ocean", label: "Ocean", css: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)", category: "cool" },
  { id: "night", label: "Night", css: "linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", category: "cool" },
  { id: "royal", label: "Royal", css: "linear-gradient(135deg, #141e30 0%, #243b55 100%)", category: "cool" },
  { id: "forest", label: "Forest", css: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)", category: "cool" },
  { id: "slate", label: "Slate", css: "linear-gradient(135deg, #485563 0%, #29323c 100%)", category: "neutral" },
  { id: "stonegrad", label: "Stone", css: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)", category: "neutral" },
  { id: "parchment", label: "Parchment", css: "linear-gradient(135deg, #f5f3ef 0%, #d7ccb8 100%)", category: "neutral" },
  { id: "candy", label: "Candy", css: "linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)", category: "vibrant" },
  { id: "aurora", label: "Aurora", css: "linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)", category: "vibrant" },
  { id: "grape", label: "Grape", css: "linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)", category: "vibrant" },
];

/** Build a two-stop linear gradient from the angle/stop builder. */
export function composeLinearGradient(angle: number, from: string, to: string): string {
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}

/** Read an angle + two stops back out of a simple two-stop gradient (for the builder); null if it's a fancier CSS string. */
export function parseLinearGradient(css: string | null): { angle: number; from: string; to: string } | null {
  if (!css) return null;
  const m = css.match(
    /^linear-gradient\(\s*(\d+)deg\s*,\s*(#[0-9a-fA-F]{3,8}|[a-z]+)\s+0%\s*,\s*(#[0-9a-fA-F]{3,8}|[a-z]+)\s+100%\s*\)$/,
  );
  if (!m) return null;
  return { angle: Number(m[1]), from: m[2]!, to: m[3]! };
}

export const TEXTURE_PRESETS: DecorPreset[] = [
  {
    id: "marble",
    label: "Marble",
    css: "linear-gradient(135deg, #f5f3ef 0%, #e8e4dc 40%, #fbfaf7 60%, #ddd8cf 100%), repeating-linear-gradient(45deg, rgba(160,150,135,0.08) 0 2px, transparent 2px 7px)",
  },
  {
    id: "stone",
    label: "Stone",
    css: "radial-gradient(circle at 30% 30%, #9a958c 0%, #6f6a61 100%), repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 3px, transparent 3px 6px)",
  },
  {
    id: "wood",
    label: "Wood",
    css: "repeating-linear-gradient(90deg, #6b4423 0 14px, #5c3a1e 14px 16px, #6b4423 16px 30px), linear-gradient(0deg, #5c3a1e, #7a4f2a)",
  },
  {
    id: "fabric",
    label: "Fabric",
    css: "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 3px), #3a4250",
  },
  {
    id: "metal",
    label: "Metal",
    css: "linear-gradient(90deg, #b8b8b8 0%, #e8e8e8 25%, #9a9a9a 50%, #e8e8e8 75%, #b8b8b8 100%)",
  },
  {
    id: "paper",
    label: "Paper",
    css: "radial-gradient(circle at 50% 50%, #fdfcf8 0%, #f1ece0 100%), repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 4px)",
  },
];

export type FrameKind = "ornamental" | "modern" | "minimal";

export interface FramePreset {
  id: string;
  label: string;
  kind: FrameKind;
}

export const FRAME_PRESETS: FramePreset[] = [
  { id: "ornamental-gold", label: "Ornamental gold", kind: "ornamental" },
  { id: "ornamental-dark", label: "Ornamental dark", kind: "ornamental" },
  { id: "modern", label: "Modern", kind: "modern" },
  { id: "minimal", label: "Minimal", kind: "minimal" },
];

const FRAME_COLORS: Record<string, string> = {
  "ornamental-gold": "#caa75a",
  "ornamental-dark": "#2b2b2b",
  modern: "#ffffff",
  minimal: "rgba(255,255,255,0.6)",
};

export function frameStyle(frameId: string | null, thickness: number): { border?: string; borderRadius?: number } {
  if (!frameId || thickness <= 0) return {};
  const preset = FRAME_PRESETS.find((f) => f.id === frameId);
  if (!preset) return {};
  const color = FRAME_COLORS[frameId] ?? "#ffffff";
  switch (preset.kind) {
    case "ornamental":
      return { border: `${thickness}px double ${color}`, borderRadius: 4 };
    case "modern":
      return { border: `${thickness}px solid ${color}`, borderRadius: 12 };
    case "minimal":
      return { border: `${thickness}px solid ${color}` };
  }
}

/** A value that is already CSS (a gradient/url function) is used as-is; a bare path/URL gets wrapped in url(). */
function asBackground(value: string): string {
  const v = value.trim();
  if (v.includes("(") || v.startsWith("#") || /^[a-z]+$/i.test(v)) return v;
  return `center / cover no-repeat url(${v})`;
}

export function backgroundCss(args: {
  mode: string | undefined;
  color: string;
  gradient?: string | null;
  texture?: string | null;
  image?: string | null;
}): string | undefined {
  switch (args.mode) {
    case "transparent":
    case "canvas":
      return undefined;
    case "gradient":
      return args.gradient ? asBackground(args.gradient) : args.color;
    case "texture":
      return args.texture ? asBackground(args.texture) : args.color;
    case "image":
      return args.image ? asBackground(args.image) : args.color;
    case "solid":
      return args.color === "transparent" ? undefined : args.color;
    default:
      return args.color === "transparent" ? undefined : args.color;
  }
}

const SCROLL_KEYFRAME: Record<string, string> = {
  up: "boardScrollUp",
  down: "boardScrollDown",
  left: "boardScrollLeft",
  right: "boardScrollRight",
};

/** The animation for a scrolling box. Distance is 2x the box size, so duration follows pixels-per-second. */
export function scrollCss(args: {
  enabled: boolean;
  direction: string;
  speed: number;
  width: number;
  height: number;
}): { animation: string } | null {
  if (!args.enabled) return null;
  const vertical = args.direction === "up" || args.direction === "down";
  const distance = 2 * (vertical ? args.height : args.width);
  const seconds = Math.max(2, distance / Math.max(1, args.speed));
  const name = SCROLL_KEYFRAME[args.direction] ?? "boardScrollUp";
  return { animation: `${name} ${seconds}s linear infinite` };
}
