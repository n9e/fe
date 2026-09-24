/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';

import Text from './index';

jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({
  useReplaceTemplateVariables: () => (value: string) => value,
}));
jest.mock('../../../Components/Markdown', () => ({
  __esModule: true,
  default: ({ content, style }: { content: string; style: React.CSSProperties }) => <div style={style}>{content}</div>,
}));

describe('Text renderer', () => {
  it('renders safely when an old panel has no custom config', () => {
    const { container } = render(<Text values={{ id: 'text-panel', type: 'text', custom: undefined } as never} series={[]} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
