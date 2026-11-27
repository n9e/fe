import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('@/pages/logExplorer/constants', () => ({ NAME_SPACE: 'log_explorer' }));
jest.mock('../../index', () => ({ LogsViewerStateContext: require('react').createContext({}) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('dompurify', () => ({ __esModule: true, default: { sanitize: (v: string) => v } }));
jest.mock('antd', () => ({
  Popover: ({ children, content }: any) => (
    <section>
      {children}
      <aside>{content}</aside>
    </section>
  ),
  Tooltip: ({ children }: any) => <>{children}</>,
}));
jest.mock('@/pages/explorer/components/Links', () => ({
  Link: ({ text, linkContext }: any) => <a data-links={linkContext.fieldConfig.linkArr.map((l: any) => l.name).join(',')}>{text}</a>,
}));
jest.mock('./tokenActionMenu', () => ({
  TokenActionMenuContent: ({ relatedLinks }: any) => (
    <nav>
      copy/filter
      {relatedLinks?.map((l: any) => (
        <button key={l.name}>{l.name}</button>
      ))}
    </nav>
  ),
}));
jest.mock('@/pages/logExplorer/utils/highlight/highlight_html', () => ({ getHighlightHtml: (v: any) => v, getTokenHighlights: () => [] }));
jest.mock('../../../../utils/renderFieldValue', () => ({ __esModule: true, default: (v: any) => v }));

const Token = require('./Token').default;
const { LogsViewerStateContext } = require('../../index');

const trace = 'e8e8bfbb2e4de0958f440232f8c4a86b';
const fieldValue = `INFO [${trace}] request`;
const apm = { name: 'APM', field: 'content', urlTemplate: '/trace?traceId=$trace_id' };
const ordinary = { name: 'Search', field: 'content', urlTemplate: '/search?q=$content' };
function render(value: string, links = [apm]) {
  const context = { fieldConfig: { version: 2, arr: [], linkArr: links, regExtractArr: [{ field: 'content', newField: 'trace_id', reg: '\\[([a-f0-9]{32})\\]' }] } };
  return renderToStaticMarkup(
    <LogsViewerStateContext.Provider value={context as any}>
      <Token segmented name='content' value={value} fieldValue={fieldValue} rawValue={{ content: fieldValue }} />
    </LogsViewerStateContext.Provider>,
  );
}
it('renders the extracted token as a link with a drilldown menu', () => {
  const html = render(trace);
  expect(html).toContain('data-links="APM"');
  expect(html).toContain('<button>APM</button>');
});
it('leaves other tokens normal and keeps copy/filter actions', () => {
  for (const token of ['INFO', 'request']) {
    const html = render(token);
    expect(html).not.toMatch(/<a(?:\s|>)/);
    expect(html).not.toContain('<button>APM</button>');
    expect(html).toContain('text-main');
    expect(html).toContain('copy/filter');
  }
});
it('uses the same filtered links in the icon and action menu', () => {
  const html = render('INFO', [apm, ordinary]);
  expect(html).toContain('data-links="Search"');
  expect(html).toContain('<button>Search</button>');
  expect(html).not.toContain('APM');
});
