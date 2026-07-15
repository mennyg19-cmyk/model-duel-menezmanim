"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import { createEditorDocStore, type EditorDocState, type EditorDocStore } from "./editor-store";
import { createEditorUiStore, type EditorUiState, type EditorUiStore } from "./ui-store";
import type { EditorObject, EditorStyle } from "../types";
import type { StyleActivationRule } from "@/core/style-engine";

export interface EditorStyleSummary {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface EditorScreenSummary {
  id: string;
  name: string;
  assignedStyleId: string | null;
}

export interface EditorConfig {
  orgId: string;
  orgSlug: string;
  styleId: string;
  previewScreenId: string | null;
  styles: EditorStyleSummary[];
  screens: EditorScreenSummary[];
  activationRules: StyleActivationRule[];
}

interface Stores {
  doc: EditorDocStore;
  ui: EditorUiStore;
  config: EditorConfig;
}

const StoreContext = createContext<Stores | null>(null);

export function EditorStoreProvider({
  initialObjects,
  initialStyle,
  config,
  children,
}: {
  initialObjects: EditorObject[];
  initialStyle: EditorStyle;
  config: EditorConfig;
  children: ReactNode;
}) {
  const ref = useRef<Stores | null>(null);
  if (!ref.current) {
    ref.current = {
      doc: createEditorDocStore({ objects: initialObjects, style: initialStyle }),
      ui: createEditorUiStore(initialObjects[0] ? [initialObjects[0].id] : [], config.previewScreenId),
      config,
    };
  } else {
    ref.current.config = config;
  }
  return <StoreContext.Provider value={ref.current}>{children}</StoreContext.Provider>;
}

function useStores(): Stores {
  const stores = useContext(StoreContext);
  if (!stores) throw new Error("Editor stores used outside EditorStoreProvider");
  return stores;
}

export function useDoc<T>(selector: (s: EditorDocState) => T): T {
  return useStore(useStores().doc, selector);
}

export function useUi<T>(selector: (s: EditorUiState) => T): T {
  return useStore(useStores().ui, selector);
}

export function useDocApi(): EditorDocStore {
  return useStores().doc;
}

export function useUiApi(): EditorUiStore {
  return useStores().ui;
}

export function useEditorConfig(): EditorConfig {
  return useStores().config;
}
