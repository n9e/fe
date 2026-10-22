/** @jest-environment jsdom */
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import ViewSelect from './index';
import { getViews } from './services';

jest.mock('./services', () => ({ getViews: jest.fn() }));
let mockReload: () => void;
jest.mock('./FormModal', () => (props: any) => {
  mockReload = props.run;
  return null;
});
jest.mock('./DropdownTrigger', () => () => null);
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('antd', () => {
  const React = require('react');
  const Container = ({ children }: any) => <div>{children}</div>;
  return {
    Input: { Group: Container },
    Tooltip: Container,
    Dropdown: Container,
    Space: Container,
    Spin: Container,
    Button: Container,
    Tag: Container,
    Menu: Container,
    Modal: {},
    message: {},
    Select: ({ value, options, placeholder }: any) => (
      <div data-testid='selection' data-value={value ?? ''}>
        {options.find((option: any) => option.value === value)?.labelName ?? placeholder}
      </div>
    ),
  };
});

const savedView = { id: 17, name: '应用错误日志', filter: JSON.stringify({ query: { query: 'saved-condition' } }) };
function setup(value = 17) {
  const onChange = jest.fn();
  const onSelect = jest.fn();
  render(
    <ViewSelect
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      validateSelection
      page='/log/explorer'
      filters={{ searchText: '' }}
      setFilters={jest.fn()}
      modalState={{ visible: false }}
      setModalState={jest.fn()}
      getFilterValues={() => ({ query: { query: 'edited-condition' } })}
      renderOptionExtra={() => null}
      placeholder='日志视图'
    />,
  );
  return { onChange, onSelect };
}

it('retains a newly saved selection while the old views are reloading', async () => {
  let resolve!: (views: any[]) => void;
  (getViews as jest.Mock).mockResolvedValueOnce([savedView]).mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  function Fixture() {
    const [selected, setSelected] = React.useState<number | undefined>(17);
    return (
      <>
        <button
          onClick={() => {
            mockReload();
            setSelected(18);
          }}
        >
          save
        </button>
        <ViewSelect
          value={selected}
          onChange={setSelected}
          validateSelection
          page='/log/explorer'
          filters={{ searchText: '' }}
          setFilters={jest.fn()}
          modalState={{ visible: false }}
          setModalState={jest.fn()}
          getFilterValues={() => ({})}
          renderOptionExtra={() => null}
          placeholder='日志视图'
        />
      </>
    );
  }
  render(<Fixture />);
  await waitFor(() => expect(screen.getByTestId('selection')).toHaveTextContent(savedView.name));
  act(() => {
    screen.getByRole('button', { name: 'save' }).click();
  });
  expect(screen.getByTestId('selection')).toHaveAttribute('data-value', '18');
  await act(async () => {
    resolve([{ ...savedView, id: 18, name: '新视图' }]);
  });
  await waitFor(() => expect(screen.getByTestId('selection')).toHaveTextContent('新视图'));
});

it('restores the name once views load without applying the saved query', async () => {
  let resolve!: (views: any[]) => void;
  (getViews as jest.Mock).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const { onChange, onSelect } = setup();
  expect(screen.getByTestId('selection')).toHaveTextContent('日志视图');
  expect(onChange).not.toHaveBeenCalled();
  resolve([savedView]);
  await waitFor(() => expect(screen.getByTestId('selection')).toHaveTextContent('应用错误日志'));
  expect(onChange).not.toHaveBeenCalled();
  expect(onSelect).not.toHaveBeenCalled();
});

it('clears a missing or inaccessible selection without changing the query', async () => {
  (getViews as jest.Mock).mockResolvedValue([]);
  const { onChange, onSelect } = setup();
  await waitFor(() => expect(onChange).toHaveBeenCalledWith(undefined));
  expect(screen.getByTestId('selection')).toHaveTextContent('日志视图');
  expect(onSelect).not.toHaveBeenCalled();
});
