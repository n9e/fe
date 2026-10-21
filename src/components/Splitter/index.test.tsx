import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Splitter from './index';

const SinglePanelSplitter = Splitter as React.ComponentType<React.ComponentProps<typeof Splitter> & { hideRight?: boolean }>;

it('uses the full width when the document panel is hidden', () => {
  const html = renderToStaticMarkup(
    <SinglePanelSplitter hideRight>
      <Splitter.Panel>Configuration</Splitter.Panel>
      <Splitter.Panel>Documentation</Splitter.Panel>
    </SinglePanelSplitter>,
  );

  expect(html).toContain('Configuration');
  expect(html).toContain('width:100%');
  expect(html).not.toContain('Documentation');
  expect(html).not.toContain('n9e-splitter-resizer');
});
