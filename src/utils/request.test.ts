/** @jest-environment jsdom */

jest.mock('@/App', () => ({ basePrefix: '' }));
jest.mock('@/services/login', () => ({ UpdateAccessToken: jest.fn() }));
jest.mock('@/components/ErrorWithDetail', () => () => null);
jest.mock('@/utils/constant', () => ({ N9E_PATHNAME: 'n9e', AccessTokenKey: 'access_token' }));
jest.mock('antd', () => ({ notification: { error: jest.fn() } }));

type FetchRoute = (url: string, init: RequestInit) => { status: number; body: unknown };

function jsonResponse(url: string, status: number, body: unknown) {
  // node-fetch (what isomorphic-fetch installs under jest) takes `url` in init, as a real fetch would set it.
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' }, url } as ResponseInit);
}

/**
 * Each test re-imports request so the module-level redirect guard and refresh lock start clean.
 */
function setup(route: FetchRoute, refresh: () => Promise<unknown>) {
  let request: typeof import('./request').default;
  let UpdateAccessToken: jest.Mock;
  let notifyError: jest.Mock;
  jest.isolateModules(() => {
    request = require('./request').default;
    UpdateAccessToken = require('@/services/login').UpdateAccessToken;
    notifyError = require('antd').notification.error;
  });
  UpdateAccessToken!.mockImplementation(refresh);
  const fetchMock = jest.fn((url: string, init: RequestInit) => {
    const { status, body } = route(url, init);
    return Promise.resolve(jsonResponse(`http://localhost${url}`, status, body));
  });
  (globalThis as unknown as { fetch: unknown }).fetch = fetchMock;
  return { request: request!, UpdateAccessToken: UpdateAccessToken!, notifyError: notifyError!, fetchMock };
}

function authHeader(init: RequestInit) {
  return (init.headers as Record<string, string>).Authorization;
}

const refreshed = () => Promise.resolve({ err: '', dat: { access_token: 'new-access', refresh_token: 'new-refresh' } });

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('access_token', 'old-access');
  localStorage.setItem('refresh_token', 'old-refresh');
});

describe('401 handling', () => {
  it('replays once with the refreshed token and resolves when the replay succeeds', async () => {
    const { request, fetchMock, UpdateAccessToken } = setup(
      (_url, init) => (authHeader(init) === 'Bearer new-access' ? { status: 200, body: { data: { models: [] } } } : { status: 401, body: {} }),
      refreshed,
    );

    const res = await request('/api/fc-model/ai-model/list', { method: 'GET' });

    expect(res).toMatchObject({ data: { models: [] }, success: true });
    expect(UpdateAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(authHeader(fetchMock.mock.calls[1][1])).toBe('Bearer new-access');
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh');
  });

  it('fails only the request when a non-n9e service still answers 401 after the replay', async () => {
    const { request, fetchMock, UpdateAccessToken, notifyError } = setup(() => ({ status: 401, body: { error: { message: 'unauthorized' } } }), refreshed);

    await expect(request('/api/fc-model/ai-model/list', { method: 'GET', silence: true })).rejects.toMatchObject({ status: 401, silence: true });

    expect(UpdateAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // Session stays: the refreshed tokens are kept, so this is not a trip to the login page.
    expect(localStorage.getItem('access_token')).toBe('new-access');
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('reports a failed replay once for a request that is not silenced', async () => {
    const { request, notifyError } = setup(() => ({ status: 401, body: { error: { message: 'unauthorized' } } }), refreshed);

    await expect(request('/api/fc-model/ai-model/list', { method: 'GET' })).rejects.toThrow('unauthorized');

    expect(notifyError).toHaveBeenCalledTimes(1);
  });

  it('goes to login when n9e itself still rejects the refreshed token', async () => {
    const { request, fetchMock } = setup(() => ({ status: 401, body: {} }), refreshed);

    await expect(request('/api/n9e/self/profile', { method: 'GET', silence: true })).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('goes to login without replaying when the refresh fails', async () => {
    const { request, fetchMock } = setup(
      () => ({ status: 401, body: {} }),
      () => Promise.resolve({ err: 'refresh token expired' }),
    );

    await expect(request('/api/fc-model/ai-model/list', { method: 'GET', silence: true })).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('fails only the request when the refresh returns an empty token', async () => {
    const { request, fetchMock } = setup(
      () => ({ status: 401, body: {} }),
      () => Promise.resolve({ err: '', dat: { access_token: '', refresh_token: '' } }),
    );

    await expect(request('/api/fc-model/ai-model/list', { method: 'GET', silence: true })).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('access_token')).toBe('old-access');
    expect(localStorage.getItem('refresh_token')).toBe('old-refresh');
  });

  it('shares one refresh between concurrent 401s', async () => {
    const { request, UpdateAccessToken } = setup(
      (_url, init) => (authHeader(init) === 'Bearer new-access' ? { status: 200, body: { data: 1 } } : { status: 401, body: {} }),
      refreshed,
    );

    await Promise.all([request('/api/fc-model/ai-model/list', { method: 'GET' }), request('/api/fc-model/skill/list', { method: 'GET' })]);

    expect(UpdateAccessToken).toHaveBeenCalledTimes(1);
  });

  it('replays a POST with its original body', async () => {
    const { request, fetchMock } = setup((_url, init) => (authHeader(init) === 'Bearer new-access' ? { status: 200, body: { data: 1 } } : { status: 401, body: {} }), refreshed);

    await request('/api/fc-model/skill/upsert', { method: 'POST', data: { name: 'skill-a' } });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].body).toBe(JSON.stringify({ name: 'skill-a' }));
  });

  it('fails only the request when the refresh call itself errors out', async () => {
    const { request, fetchMock } = setup(
      () => ({ status: 401, body: {} }),
      () => Promise.reject(new Error('network down')),
    );

    await expect(request('/api/fc-model/ai-model/list', { method: 'GET', silence: true })).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('refresh_token')).toBe('old-refresh');
  });

  describe('without a refresh token', () => {
    beforeEach(() => localStorage.removeItem('refresh_token'));

    it('fails only the request for a non-n9e service', async () => {
      const { request, UpdateAccessToken } = setup(() => ({ status: 401, body: {} }), refreshed);

      await expect(request('/api/fc-model/ai-model/list', { method: 'GET', silence: true })).rejects.toMatchObject({ status: 401 });

      expect(UpdateAccessToken).not.toHaveBeenCalled();
      expect(localStorage.getItem('access_token')).toBe('old-access');
    });

    it('goes to login for an n9e endpoint', async () => {
      const { request, UpdateAccessToken } = setup(() => ({ status: 401, body: {} }), refreshed);

      await expect(request('/api/n9e/self/profile', { method: 'GET', silence: true })).rejects.toMatchObject({ status: 401 });

      expect(UpdateAccessToken).not.toHaveBeenCalled();
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });
});
