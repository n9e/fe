import LogFieldValue from '../components/LogFieldValue';
import getColumnsFromFields from './getColumnsFromFields';

jest.mock('../components/LogFieldValue', () => ({
  __esModule: true,
  default: 'LogFieldValue',
}));

describe('getColumnsFromFields', () => {
  it('keeps field interactions when filtering is unavailable', () => {
    const columns = getColumnsFromFields({
      id_key: 'id',
      fields: ['message'],
      data: [{ id: '1', message: 'hello' }],
    });

    const cell = columns[0].formatter({ row: { id: '1', message: 'hello' } });

    expect(cell.props.children.type).toBe(LogFieldValue);
    expect(cell.props.children.props).toMatchObject({
      name: 'message',
      value: 'hello',
      rawValue: { id: '1', message: 'hello' },
    });
  });
});
