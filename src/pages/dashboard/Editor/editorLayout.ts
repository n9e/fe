export const EDITOR_LAYOUT_STORAGE_KEY = 'n9e-dashboard-editor-layout';

export const editorLayoutDefaults = {
  previewHeight: 300,
  sidebarWidth: 600,
};

export const editorLayoutMinimums = {
  previewHeight: 180,
  queryHeight: 240,
  sidebarWidth: 360,
  workspaceWidth: 360,
};

export interface EditorLayout {
  previewHeight: number;
  sidebarWidth: number;
}

export interface EditorLayoutBounds {
  maxPreviewHeight?: number;
  maxSidebarWidth?: number;
}

function getStorage(storage?: Storage | null) {
  if (storage !== undefined) return storage;
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function getValidSize(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function clampSize(value: number, minimum: number, maximum?: number) {
  if (maximum === undefined) return Math.max(value, minimum);
  return Math.max(minimum, Math.min(value, maximum));
}

export function clampEditorLayout(layout: EditorLayout, bounds: EditorLayoutBounds = {}): EditorLayout {
  return {
    previewHeight: clampSize(layout.previewHeight, editorLayoutMinimums.previewHeight, bounds.maxPreviewHeight),
    sidebarWidth: clampSize(layout.sidebarWidth, editorLayoutMinimums.sidebarWidth, bounds.maxSidebarWidth),
  };
}

export function readEditorLayout(storage?: Storage | null): EditorLayout {
  try {
    const raw = getStorage(storage)?.getItem(EDITOR_LAYOUT_STORAGE_KEY);
    if (!raw) return { ...editorLayoutDefaults };
    const parsed = JSON.parse(raw) as Partial<EditorLayout>;
    return {
      previewHeight: getValidSize(parsed.previewHeight, editorLayoutDefaults.previewHeight),
      sidebarWidth: getValidSize(parsed.sidebarWidth, editorLayoutDefaults.sidebarWidth),
    };
  } catch {
    return { ...editorLayoutDefaults };
  }
}

export function writeEditorLayout(layout: EditorLayout, storage?: Storage | null) {
  try {
    getStorage(storage)?.setItem(EDITOR_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // Storage may be unavailable in privacy mode; layout resizing should still work for this session.
  }
}
