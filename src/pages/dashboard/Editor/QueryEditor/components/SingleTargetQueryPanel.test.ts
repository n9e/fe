import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import SingleTargetQueryPanel from './SingleTargetQueryPanel';

jest.mock('../../Components/Collapse/style.less', () => ({}));

describe('SingleTargetQueryPanel', () => {
  it('keeps every datasource selector inside the mixed query panel header', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        SingleTargetQueryPanel,
        {
          refId: 'A',
          datasourceSelect: React.createElement('span', null, 'sls_9000'),
          actions: React.createElement('button', null, 'delete'),
        },
        React.createElement('div', { 'data-testid': 'sls-query-editor' }, 'SLS query'),
      ),
    );

    const headerStart = html.indexOf('n9e-collapse-header');
    const datasourceStart = html.indexOf('data-testid="mixed-query-datasource"');
    const contentStart = html.indexOf('n9e-collapse-content');
    const queryEditorStart = html.indexOf('data-testid="sls-query-editor"');

    expect(headerStart).toBeGreaterThanOrEqual(0);
    expect(datasourceStart).toBeGreaterThan(headerStart);
    expect(datasourceStart).toBeLessThan(contentStart);
    expect(queryEditorStart).toBeGreaterThan(contentStart);
  });
});
