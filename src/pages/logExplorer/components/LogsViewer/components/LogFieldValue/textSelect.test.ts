/// <reference types="jest" />

import { getTextSelectionPopoverResult } from './textSelect';

describe('textSelect', () => {
  it('returns selected fragment and relative anchor position for valid selection', () => {
    const anchorNode = { id: 'anchor' } as unknown as Node;
    const focusNode = { id: 'focus' } as unknown as Node;
    const commonAncestorContainer = { id: 'root-child' } as unknown as Node;

    const root = {
      contains(node: Node | null) {
        return node === anchorNode || node === focusNode || node === commonAncestorContainer;
      },
    };

    const result = getTextSelectionPopoverResult({
      host: {
        getBoundingClientRect: () => ({ left: 20, top: 10 }),
      },
      root,
      selection: {
        rangeCount: 1,
        anchorNode,
        focusNode,
        toString: () => 'Fragment.',
        getRangeAt: () => ({
          collapsed: false,
          commonAncestorContainer,
          getBoundingClientRect: () => ({ left: 35, bottom: 45 }),
        }),
      },
      isNodeInside: (currentRoot, node) => currentRoot.contains(node),
    });

    expect(result).toEqual({
      selectedFragment: 'Fragment.',
      anchorRect: {
        left: 15,
        top: 35,
      },
    });
  });

  it('returns null when selection extends outside the token root', () => {
    const anchorNode = { id: 'outside-anchor' } as unknown as Node;
    const focusNode = { id: 'outside' } as unknown as Node;
    const commonAncestorContainer = { id: 'outside-ancestor' } as unknown as Node;

    const root = {
      contains: () => false,
    };

    const result = getTextSelectionPopoverResult({
      host: {
        getBoundingClientRect: () => ({ left: 20, top: 10 }),
      },
      root,
      selection: {
        rangeCount: 1,
        anchorNode,
        focusNode,
        toString: () => 'Fragment. outside',
        getRangeAt: () => ({
          collapsed: false,
          commonAncestorContainer,
          getBoundingClientRect: () => ({ left: 35, bottom: 45 }),
        }),
      },
      isNodeInside: (currentRoot, node) => currentRoot.contains(node),
    });

    expect(result).toBeNull();
  });

  it('returns result when selection end point is outside root but root contains selection text', () => {
    const anchorNode = { id: 'anchor' } as unknown as Node;
    const focusNode = { id: 'outer-wrapper' } as unknown as Node;
    const commonAncestorContainer = { id: 'outer-wrapper' } as unknown as Node;

    const root = {
      contains(node: Node | null) {
        return node === anchorNode;
      },
    };

    const result = getTextSelectionPopoverResult({
      host: {
        getBoundingClientRect: () => ({ left: 20, top: 10 }),
      },
      root,
      selection: {
        rangeCount: 1,
        anchorNode,
        focusNode,
        toString: () => 'Fragment. outside',
        getRangeAt: () => ({
          collapsed: false,
          commonAncestorContainer,
          getBoundingClientRect: () => ({ left: 35, bottom: 45 }),
        }),
      },
      isNodeInside: (currentRoot, node) => currentRoot.contains(node),
      selectionTextWithinRoot: 'Fragment.',
    });

    expect(result).toEqual({
      selectedFragment: 'Fragment.',
      anchorRect: {
        left: 15,
        top: 35,
      },
    });
  });

  it('returns result when end point is outside root but selected text is fully inside root', () => {
    const anchorNode = { id: 'anchor' } as unknown as Node;
    const focusNode = { id: 'outer-wrapper' } as unknown as Node;
    const commonAncestorContainer = { id: 'outer-wrapper' } as unknown as Node;

    const root = {
      contains(node: Node | null) {
        return node === anchorNode;
      },
    };

    const result = getTextSelectionPopoverResult({
      host: {
        getBoundingClientRect: () => ({ left: 20, top: 10 }),
      },
      root,
      selection: {
        rangeCount: 1,
        anchorNode,
        focusNode,
        toString: () => 'Fragment.',
        getRangeAt: () => ({
          collapsed: false,
          commonAncestorContainer,
          getBoundingClientRect: () => ({ left: 35, bottom: 45 }),
        }),
      },
      isNodeInside: (currentRoot, node) => currentRoot.contains(node),
      selectionTextWithinRoot: 'Fragment.',
    });

    expect(result).toEqual({
      selectedFragment: 'Fragment.',
      anchorRect: {
        left: 15,
        top: 35,
      },
    });
  });

  it('returns result when anchor and focus are both outside root but selected text is fully inside root', () => {
    const anchorNode = { id: 'outer-wrapper-anchor' } as unknown as Node;
    const focusNode = { id: 'outer-wrapper-focus' } as unknown as Node;
    const commonAncestorContainer = { id: 'outer-wrapper' } as unknown as Node;

    const root = {
      contains: () => false,
    };

    const result = getTextSelectionPopoverResult({
      host: {
        getBoundingClientRect: () => ({ left: 20, top: 10 }),
      },
      root,
      selection: {
        rangeCount: 1,
        anchorNode,
        focusNode,
        toString: () => 'Fragment.',
        getRangeAt: () => ({
          collapsed: false,
          commonAncestorContainer,
          getBoundingClientRect: () => ({ left: 35, bottom: 45 }),
        }),
      },
      isNodeInside: (currentRoot, node) => currentRoot.contains(node),
      selectionTextWithinRoot: 'Fragment.',
    });

    expect(result).toEqual({
      selectedFragment: 'Fragment.',
      anchorRect: {
        left: 15,
        top: 35,
      },
    });
  });

  it('returns result when anchor is outside root but focus is inside root', () => {
    const anchorNode = { id: 'outside-anchor' } as unknown as Node;
    const focusNode = { id: 'inside-focus' } as unknown as Node;
    const commonAncestorContainer = { id: 'shared-ancestor' } as unknown as Node;

    const root = {
      contains(node: Node | null) {
        return node === focusNode || node === commonAncestorContainer;
      },
    };

    const result = getTextSelectionPopoverResult({
      host: {
        getBoundingClientRect: () => ({ left: 20, top: 10 }),
      },
      root,
      selection: {
        rangeCount: 1,
        anchorNode,
        focusNode,
        toString: () => 'key: value',
        getRangeAt: () => ({
          collapsed: false,
          commonAncestorContainer,
          getBoundingClientRect: () => ({ left: 35, bottom: 45 }),
        }),
      },
      isNodeInside: (currentRoot, node) => currentRoot.contains(node),
      selectionTextWithinRoot: 'value',
    });

    expect(result).toEqual({
      selectedFragment: 'value',
      anchorRect: {
        left: 15,
        top: 35,
      },
    });
  });

  it('returns null when focus is inside root but root contains no selection text', () => {
    const anchorNode = { id: 'outside-anchor' } as unknown as Node;
    const focusNode = { id: 'inside-focus' } as unknown as Node;
    const commonAncestorContainer = { id: 'shared-ancestor' } as unknown as Node;

    const root = {
      contains(node: Node | null) {
        return node === focusNode;
      },
    };

    const result = getTextSelectionPopoverResult({
      host: {
        getBoundingClientRect: () => ({ left: 20, top: 10 }),
      },
      root,
      selection: {
        rangeCount: 1,
        anchorNode,
        focusNode,
        toString: () => '   ',
        getRangeAt: () => ({
          collapsed: false,
          commonAncestorContainer,
          getBoundingClientRect: () => ({ left: 35, bottom: 45 }),
        }),
      },
      isNodeInside: (currentRoot, node) => currentRoot.contains(node),
      selectionTextWithinRoot: '',
    });

    expect(result).toBeNull();
  });

  it('returns null for collapsed selections', () => {
    const commonAncestorContainer = { id: 'root-child' } as unknown as Node;

    const result = getTextSelectionPopoverResult({
      host: {
        getBoundingClientRect: () => ({ left: 20, top: 10 }),
      },
      root: {
        contains: () => true,
      },
      selection: {
        rangeCount: 1,
        anchorNode: commonAncestorContainer,
        focusNode: commonAncestorContainer,
        toString: () => 'Fragment.',
        getRangeAt: () => ({
          collapsed: true,
          commonAncestorContainer,
          getBoundingClientRect: () => ({ left: 35, bottom: 45 }),
        }),
      },
      isNodeInside: () => true,
    });

    expect(result).toBeNull();
  });
});
