// P6.15 — cross-style clipboard via localStorage (+ in-memory for same session).

import type { EditorObject } from "../types";

const KEY = "menez-editor-clipboard-v1";

let buffer: EditorObject[] = [];

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(buffer));
  } catch {
    /* ignore quota */
  }
}

function hydrate() {
  if (buffer.length > 0) return;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as EditorObject[];
    if (Array.isArray(parsed)) buffer = parsed;
  } catch {
    /* ignore */
  }
}

export function copyObjects(objects: EditorObject[]): void {
  buffer = objects.map((o) => ({ ...o, content: { ...o.content }, appearance: { ...o.appearance } }));
  persist();
}

export function pasteObjects(): EditorObject[] | null {
  hydrate();
  if (buffer.length === 0) return null;
  return buffer.map((o) => ({ ...o, content: { ...o.content }, appearance: { ...o.appearance } }));
}

export function hasClipboard(): boolean {
  hydrate();
  return buffer.length > 0;
}
