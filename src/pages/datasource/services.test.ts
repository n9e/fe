import request from '@/utils/request';
import { submitRequest } from './services';

let mockIsPro: boolean;

jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ data: { id: 1 } }) }));
jest.mock('@/store/common', () => ({ RequestMethod: { Post: 'POST' } }));
jest.mock('@/utils/constant', () => ({
  get IS_PRO() {
    return mockIsPro;
  },
}));

it.each([
  [true, '/api/n9e-plus/datasource/upsert'],
  [false, '/api/n9e/datasource/upsert'],
])('uses the correct datasource save endpoint when IS_PRO is %s', async (isPro, url) => {
  mockIsPro = isPro;
  const data = { plugin_type: 'elasticsearch', settings: { use_edge: isPro } };

  await expect(submitRequest(data)).resolves.toEqual({ id: 1 });
  expect(request).toHaveBeenCalledWith(url, { method: 'POST', data });
});
