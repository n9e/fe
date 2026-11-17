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
  it('updates both axes from center to start and end without retaining stale CSS', () => {
    const panel = { id: 'text-panel', type: 'text', custom: { content: 'ALIGN', justifyContent: 'center', alignItems: 'center' } };
    const view = render(<Text values={panel as never} series={[]} />);
    expect(view.container.firstChild).toHaveStyle({ justifyContent: 'center', alignItems: 'center' });
    for (const [value, css] of [
      ['flexStart', 'flex-start'],
      ['flexEnd', 'flex-end'],
    ]) {
      view.rerender(<Text values={{ ...panel, custom: { ...panel.custom, justifyContent: value, alignItems: value } } as never} series={[]} />);
      expect(view.container.firstChild).toHaveStyle({ display: 'flex', justifyContent: css, alignItems: css });
    }
  });

  it('renders safely when an old panel has no custom config', () => {
    const { container } = render(<Text values={{ id: 'text-panel', type: 'text', custom: undefined } as never} series={[]} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
