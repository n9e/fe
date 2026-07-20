import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('@ant-design/icons', () => ({ CopyOutlined: () => null }));
jest.mock('react-i18next', () => ({ Trans: () => null }));
jest.mock('antd', () => {
  const React = require('react');

  return {
    Button: ({ children }: { children?: React.ReactNode }) => React.createElement('button', null, children),
    Popover: ({ children }: { children: React.ReactElement }) => children,
    Tooltip: ({ title, children }: { title?: React.ReactNode; children: React.ReactElement }) => React.createElement('span', { 'data-tooltip-title': title }, children),
  };
});

import Tags from './Tags';

describe('TableTags tooltip', () => {
  beforeAll(() => {
    jest.spyOn(React, 'useLayoutEffect').mockImplementation(React.useEffect);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('shows the complete tag label through the shared tooltip component', () => {
    const label = 'environment=production-with-a-very-long-name';
    const markup = renderToStaticMarkup(React.createElement(Tags, { data: [label], maxWidth: 80 }));

    expect(markup).toContain(`data-tooltip-title="${label}"`);
  });

  it('does not render a tooltip when getTooltipTitle returns undefined', () => {
    const markup = renderToStaticMarkup(
      React.createElement(Tags, {
        data: ['environment=production'],
        maxWidth: 80,
        getTooltipTitle: () => undefined,
      }),
    );

    expect(markup).not.toContain('data-tooltip-title');
  });
});
