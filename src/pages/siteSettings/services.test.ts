jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({}) }));
jest.mock('@/utils/constant', () => ({ N9E_PATHNAME: 'n9e-plus' }));
jest.mock('@/store/common', () => ({ RequestMethod: { Get: 'GET', Put: 'PUT' } }));

import request from '@/utils/request';
import { putN9eConfig } from './services';

test('commercial site settings use the endpoint that validates topology configuration', async () => {
  const data = { ckey: 'site_info', cval: JSON.stringify({ topology: { datasource_id: 2 } }) };
  await putN9eConfig(data);
  expect(request).toHaveBeenCalledWith('/api/n9e-plus/config', { method: 'PUT', data });
});

test('unrelated configuration writes retain their existing endpoint', async () => {
  const data = { ckey: 'other', cval: '{}' };
  await putN9eConfig(data);
  expect(request).toHaveBeenCalledWith('/api/n9e/config', { method: 'PUT', data });
});
