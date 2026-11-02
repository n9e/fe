/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { fireEvent, render, screen } from '@testing-library/react';

import TrimInput, { trimNormalize } from './index';

describe('trimNormalize', () => {
  it('trims strings and passes other values through', () => {
    expect(trimNormalize(' t1 ')).toBe('t1');
    expect(trimNormalize(undefined)).toBeUndefined();
  });
});

function renderInForm(field: React.ReactNode, onValues: (values: any) => void) {
  return render(
    <Form onValuesChange={(_, all) => onValues(all)}>
      <Form.Item name='v'>{field}</Form.Item>
    </Form>,
  );
}

describe('TrimInput', () => {
  it.each([
    ['Input', <TrimInput placeholder='f' />],
    ['TextArea', <TrimInput.TextArea placeholder='f' />],
    ['Password', <TrimInput.Password placeholder='f' />],
  ])('%s trims leading and trailing spaces on blur', (_name, field) => {
    let values: any = {};
    renderInForm(field, (v) => (values = v));
    const el = screen.getByPlaceholderText('f') as HTMLInputElement;

    fireEvent.change(el, { target: { value: '  a b  ' } });
    expect(values.v).toBe('  a b  ');

    fireEvent.blur(el);
    expect(values.v).toBe('a b');
    expect(el.value).toBe('a b');
  });

  it('keeps spaces while typing so inner spaces can be entered', () => {
    let values: any = {};
    renderInForm(<TrimInput placeholder='f' />, (v) => (values = v));
    const el = screen.getByPlaceholderText('f');

    fireEvent.change(el, { target: { value: 'a ' } });
    expect(values.v).toBe('a ');
  });

  it('trims on Enter and still calls the caller handlers', () => {
    let values: any = {};
    const onBlur = jest.fn();
    const onPressEnter = jest.fn();
    renderInForm(<TrimInput placeholder='f' onBlur={onBlur} onPressEnter={onPressEnter} />, (v) => (values = v));
    const el = screen.getByPlaceholderText('f');

    fireEvent.change(el, { target: { value: ' x ' } });
    fireEvent.keyDown(el, { key: 'Enter', keyCode: 13 });
    expect(values.v).toBe('x');
    expect(onPressEnter).toHaveBeenCalledTimes(1);

    fireEvent.blur(el);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('does not fire onChange on blur when nothing to trim', () => {
    const onChange = jest.fn();
    render(<TrimInput placeholder='f' value='x' onChange={onChange} />);
    fireEvent.blur(screen.getByPlaceholderText('f'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
