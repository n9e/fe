import _ from 'lodash';
import { highlightTags } from './highlight_tags';
import { htmlTags } from './html_tags';

export function getHighlightHtml(fieldValue: string | object, highlights: string[] | undefined | null) {
  let highlightHtml = typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : fieldValue;

  _.each(highlights, function (highlight) {
    const escapedHighlight = _.escape(highlight);

    const untaggedHighlight = escapedHighlight.split(highlightTags.pre).join('').split(highlightTags.post).join('');

    const taggedHighlight = escapedHighlight.split(highlightTags.pre).join(htmlTags.pre).split(highlightTags.post).join(htmlTags.post);

    highlightHtml = highlightHtml.split(untaggedHighlight).join(taggedHighlight);
  });

  return highlightHtml;
}
