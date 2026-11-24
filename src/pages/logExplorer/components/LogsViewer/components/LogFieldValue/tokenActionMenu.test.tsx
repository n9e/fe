/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { TokenActionMenuContent } from './tokenActionMenu';
import { normalizeRawValueForNav } from './tokenActionMenu.utils';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('@/components/IconFont', () => () => null);
jest.mock('@/pages/explorer/components/Links', () => ({ handleNav: jest.fn() }));
jest.mock('../../../../constants', () => ({ NAME_SPACE: 'logExplorer' }));

describe('tokenActionMenu', () => {
  it('parses JSON strings into objects', () => {
    const result = normalizeRawValueForNav({
      payload: '{"foo":1}',
    });

    expect(result).toEqual({
      payload: { foo: 1 },
    });
  });

  it('keeps non-JSON strings untouched', () => {
    const result = normalizeRawValueForNav({
      msg: 'plain-text',
    });

    expect(result).toEqual({
      msg: 'plain-text',
    });
  });

  it('keeps non-string values untouched', () => {
    const result = normalizeRawValueForNav({
      count: 1,
      enabled: true,
      nested: { a: 1 },
    });

    expect(result).toEqual({
      count: 1,
      enabled: true,
      nested: { a: 1 },
    });
  });

  it('returns empty object for undefined input', () => {
    expect(normalizeRawValueForNav(undefined)).toEqual({});
  });
});

describe('tokenActionMenu query filters', () => {
  const fieldValue = 'error: connection timeout';
  const props: React.ComponentProps<typeof TokenActionMenuContent> = {
    close: jest.fn(),
    name: 'message',
    fieldValue,
    fragmentValue: 'connection',
    showFragmentFilters: true,
    indexInfo: { isIndex: true, indexName: 'message.keyword' },
    start: 0,
    end: 0,
  };

  it.each([
    ['logs.filterAnd', ':', 'AND', 'connection'],
    ['logs.filterNot', ':', 'NOT', 'connection'],
    ['logs.filterAllAnd', '=', 'AND', fieldValue],
    ['logs.filterAllNot', '=', 'NOT', fieldValue],
    ['logs.filterExists', '=', 'EXISTS', fieldValue],
  ])('preserves %s for existing data sources', (label, assignmentOperator, operator, value) => {
    const onTokenClick = jest.fn();
    render(<TokenActionMenuContent {...props} showExistsAction onTokenClick={onTokenClick} />);

    fireEvent.click(screen.getByText(label));

    expect(onTokenClick).toHaveBeenCalledWith({ key: 'message', indexName: 'message.keyword', assignmentOperator, operator, value });
  });

  it.each([{ fragmentValue: fieldValue }, { showFragmentFilters: false }])('keeps only the full-field filters with %j', (overrides) => {
    render(<TokenActionMenuContent {...props} {...overrides} onTokenClick={jest.fn()} />);

    expect(screen.queryByText('logs.filterAnd')).not.toBeInTheDocument();
    expect(screen.queryByText('logs.filterNot')).not.toBeInTheDocument();
    expect(screen.getByText('logs.filterAllAnd')).toBeInTheDocument();
  });

  it('hides filters when the field is not indexed and no nested field was resolved', () => {
    render(<TokenActionMenuContent {...props} indexInfo={{ isIndex: false, indexName: '' }} onTokenClick={jest.fn()} />);

    expect(screen.queryByText('logs.filterAnd')).not.toBeInTheDocument();
    expect(screen.queryByText('logs.filterAllAnd')).not.toBeInTheDocument();
  });

  it.each([
    ['logs.filterAnd', 'AND'],
    ['logs.filterNot', 'NOT'],
  ])('applies %s to the resolved nested field even when the displayed parent is not indexed', (label, operator) => {
    const onTokenClick = jest.fn();
    render(
      <TokenActionMenuContent
        {...props}
        name='attr.host'
        fieldValue='{"arch":"arm\\u0036\\u0034"}'
        fragmentValue={'arm\\u0036\\u0034'}
        fragmentField={{ fieldName: 'attr.host.arch', value: 'arm64' }}
        indexInfo={{ isIndex: false, indexName: '' }}
        onTokenClick={onTokenClick}
      />,
    );

    fireEvent.click(screen.getByText(label));

    expect(onTokenClick).toHaveBeenCalledWith({ key: 'attr.host.arch', indexName: 'attr.host.arch', assignmentOperator: ':', operator, value: 'arm64' });
    expect(screen.queryByText('logs.filterAllAnd')).not.toBeInTheDocument();
  });
});
