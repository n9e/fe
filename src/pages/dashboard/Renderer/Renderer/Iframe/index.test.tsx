/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';

import Iframe from './index';

jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({
  useReplaceTemplateVariables: () => (value: string) => value,
}));

describe('Iframe renderer', () => {
  it('renders an empty iframe when a newly created panel has no src', () => {
    const { container } = render(<Iframe values={{ id: 'iframe-panel', type: 'iframe', custom: {} } as never} series={[]} />);
    const iframe = container.querySelector('iframe');

    expect(iframe).toBeInTheDocument();
    expect(iframe).not.toHaveAttribute('src');
  });
});
