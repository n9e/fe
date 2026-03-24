import { highlightTags } from './highlight_tags';

const FRAGMENT_SIZE = Math.pow(2, 31) - 1;

export function getHighlightRequest(shouldHighlight: boolean) {
  if (!shouldHighlight) return;

  return {
    pre_tags: [highlightTags.pre],
    post_tags: [highlightTags.post],
    fields: {
      '*': {},
    },
    fragment_size: FRAGMENT_SIZE,
  };
}
