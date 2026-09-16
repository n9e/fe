/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';

import QueryBoxPrefix, { QueryBoxColumn } from './index';

// A page that attaches nothing must keep the markup it had: the box is the
// only element, with no wrapper around it.
describe('with nothing attached', () => {
  it('QueryBoxPrefix renders the box bare', () => {
    const { container } = render(
      <QueryBoxPrefix>
        <textarea aria-label='box' />
      </QueryBoxPrefix>,
    );
    expect(container.firstChild).toBe(screen.getByLabelText('box'));
  });

  it('QueryBoxColumn renders the box bare', () => {
    const { container } = render(
      <QueryBoxColumn className='min-w-0'>
        <textarea aria-label='box' />
      </QueryBoxColumn>,
    );
    expect(container.firstChild).toBe(screen.getByLabelText('box'));
  });
});

describe('with something attached', () => {
  it('pins the prefix inside the box', () => {
    render(
      <QueryBoxPrefix prefix={<button type='button'>ai</button>}>
        <textarea aria-label='box' />
      </QueryBoxPrefix>,
    );
    expect(screen.getByRole('button', { name: 'ai' }).parentElement?.parentElement).toBe(screen.getByLabelText('box').parentElement);
  });

  it('puts the box in a column, marked when prefixed, with what hangs under it after the box', () => {
    const { container } = render(
      <QueryBoxColumn className='min-w-0' prefixed below={<div>dock</div>}>
        <textarea aria-label='box' />
      </QueryBoxColumn>,
    );
    const column = container.firstChild as HTMLElement;
    expect(column).toHaveClass('min-w-0', 'query-box-prefix-column');
    expect(column.lastChild).toHaveTextContent('dock');
  });

  it('does not mark a column whose box has no prefix', () => {
    const { container } = render(
      <QueryBoxColumn className='min-w-0' below={<div>dock</div>}>
        <textarea aria-label='box' />
      </QueryBoxColumn>,
    );
    expect(container.firstChild).not.toHaveClass('query-box-prefix-column');
  });
});
