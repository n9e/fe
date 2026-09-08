import { visualizations } from '../../Editor/config';
import adjustInitialValues from './adjustInitialValues';

jest.mock('../../utils/getDefaultTargets', () => ({
  __esModule: true,
  default: () => [],
}));

describe('adjustInitialValues', () => {
  it.each(visualizations.map(({ type }) => [type]))('keeps the selected %s visualization type when adding a panel', (type) => {
    const { initialValues } = adjustInitialValues(type, {}, [], []);

    expect(initialValues.type).toBe(type);
    expect(initialValues.custom).toBeDefined();
    expect(initialValues.options).toBeDefined();
  });
});
