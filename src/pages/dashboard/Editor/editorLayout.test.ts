import { EDITOR_LAYOUT_STORAGE_KEY, clampEditorLayout, editorLayoutDefaults, editorLayoutMinimums, readEditorLayout, writeEditorLayout } from './editorLayout';

function createStorage(initialValue?: string): Storage {
  let value = initialValue ?? null;
  return {
    getItem: jest.fn(() => value),
    setItem: jest.fn((_key: string, nextValue: string) => {
      value = nextValue;
    }),
    removeItem: jest.fn(() => {
      value = null;
    }),
    clear: jest.fn(() => {
      value = null;
    }),
    key: jest.fn(() => null),
    get length() {
      return value ? 1 : 0;
    },
  } as Storage;
}

describe('dashboard editor layout', () => {
  it('uses the default layout when there is no cached value or the cache is invalid', () => {
    expect(readEditorLayout(createStorage())).toEqual(editorLayoutDefaults);
    expect(readEditorLayout(createStorage('{bad json'))).toEqual(editorLayoutDefaults);
    expect(readEditorLayout(createStorage(JSON.stringify({ previewHeight: '300', sidebarWidth: -1 })))).toEqual(editorLayoutDefaults);
  });

  it('restores valid cached dimensions and writes updates to the dedicated key', () => {
    const storage = createStorage(JSON.stringify({ previewHeight: 420, sidebarWidth: 480 }));

    expect(readEditorLayout(storage)).toEqual({ previewHeight: 420, sidebarWidth: 480 });

    writeEditorLayout({ previewHeight: 360, sidebarWidth: 520 }, storage);
    expect(storage.setItem).toHaveBeenCalledWith(EDITOR_LAYOUT_STORAGE_KEY, JSON.stringify({ previewHeight: 360, sidebarWidth: 520 }));
  });

  it('keeps cached dimensions inside the current editor bounds', () => {
    expect(clampEditorLayout({ previewHeight: 900, sidebarWidth: 900 }, { maxPreviewHeight: 440, maxSidebarWidth: 640 })).toEqual({ previewHeight: 440, sidebarWidth: 640 });
    expect(clampEditorLayout({ previewHeight: 10, sidebarWidth: 10 })).toEqual({
      previewHeight: editorLayoutMinimums.previewHeight,
      sidebarWidth: editorLayoutMinimums.sidebarWidth,
    });
  });
});
