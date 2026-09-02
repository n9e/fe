/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { normalizeError } from '@/utils/appError';

import PageError from './index';

const replace = jest.fn();
const goBack = jest.fn();
const getAdminList = jest.fn();
let canGoBack = false;

jest.mock('react-router', () => ({
  useHistory: () => ({ replace, goBack }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    // 把插值也拼进去，测试才能断言资源名和处理人真的进了文案
    t: (key: string, options?: Record<string, unknown>) => {
      const params = options ? Object.entries(options).filter(([name]) => name !== 'defaultValue') : [];
      return params.length ? `${key}:${params.map(([, value]) => value).join(',')}` : key;
    },
  }),
}));

jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('@/utils/pageError', () => ({ canGoBackInApp: () => canGoBack }));
jest.mock('./services', () => ({ getAdminList: (...args: unknown[]) => getAdminList(...args) }));
jest.mock('./locale', () => ({}));

describe('PageError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    canGoBack = false;
    getAdminList.mockResolvedValue([]);
  });

  it('renders the 404 copy', () => {
    render(<PageError status={404} />);

    expect(screen.getByText('404.title')).toBeTruthy();
    expect(screen.getByText('404.desc')).toBeTruthy();
  });

  it('names the restricted resource when the backend reports one', () => {
    const error = normalizeError({
      status: 403,
      message: 'denied',
      data: { error: { message: 'denied', resource: { type: 'dashboard', name: 'core dashboard' } } },
    });

    render(<PageError error={error} />);

    expect(screen.getByText('403.desc_with_resource:core dashboard')).toBeTruthy();
  });

  it('names who can grant access when the backend reports owners, without querying admins', () => {
    const error = normalizeError({
      status: 403,
      message: 'denied',
      data: { error: { message: 'denied', owners: [{ username: 'root', nickname: 'Root' }] } },
    });

    render(<PageError error={error} />);

    expect(screen.getByText('403.contact_owners:Root(root)')).toBeTruthy();
    expect(getAdminList).not.toHaveBeenCalled();
  });

  it('falls back to querying administrators when the backend reports no owners', async () => {
    getAdminList.mockResolvedValue(['Root']);

    render(<PageError error={normalizeError({ status: 403, message: 'denied' })} />);

    await waitFor(() => expect(screen.getByText('403.contact_owners:Root')).toBeTruthy());
  });

  it('caps a long administrator list instead of dumping the whole roster', async () => {
    // 真实环境里管理员可能几十个：全列出来既没法用，也等于把用户名单摊在错误页上
    getAdminList.mockResolvedValue(['a', 'b', 'c', 'd', 'e']);

    render(<PageError error={normalizeError({ status: 403, message: 'denied' })} />);

    await waitFor(() => expect(screen.getByText(/403.contact_owners:a、b、c/)).toBeTruthy());
    expect(screen.queryByText(/、d/)).toBeNull();
    expect(screen.getByText(/403.owners_more/)).toBeTruthy();
  });

  it('reveals the rest of the list on demand, so a truncated name is never a dead end', async () => {
    getAdminList.mockResolvedValue(['a', 'b', 'c', 'd', 'e']);

    render(<PageError error={normalizeError({ status: 403, message: 'denied' })} />);
    await waitFor(() => expect(screen.getByText(/403.owners_more/)).toBeTruthy());

    await userEvent.click(screen.getByText(/403.owners_more/));

    expect(screen.getByText(/403.contact_owners:a、b、c、d、e/)).toBeTruthy();
    expect(screen.getByText('403.owners_collapse')).toBeTruthy();
  });

  it('does not offer to expand when everyone already fits', async () => {
    getAdminList.mockResolvedValue(['a', 'b']);

    render(<PageError error={normalizeError({ status: 403, message: 'denied' })} />);

    await waitFor(() => expect(screen.getByText(/403.contact_owners:a、b/)).toBeTruthy());
    expect(screen.queryByText(/403.owners_more/)).toBeNull();
  });

  it('degrades to generic copy when the administrator lookup fails', async () => {
    getAdminList.mockRejectedValue(new Error('no such api'));

    render(<PageError error={normalizeError({ status: 403, message: 'denied' })} />);

    await waitFor(() => expect(screen.getByText('403.contact_admin')).toBeTruthy());
  });

  it('goes home instead of back when there is no page to go back to inside the app', async () => {
    render(<PageError status={403} />);

    await userEvent.click(screen.getByText('action.back'));

    expect(goBack).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('goes back once the user has navigated inside the app', async () => {
    canGoBack = true;
    render(<PageError status={403} />);

    await userEvent.click(screen.getByText('action.back'));

    expect(goBack).toHaveBeenCalled();
  });

  it('keeps diagnostics collapsed until asked', async () => {
    render(<PageError error={normalizeError({ status: 403, message: 'denied', path: '/dashboards/1024' })} />);

    expect(screen.queryByText(/\/dashboards\/1024/)).toBeNull();

    await userEvent.click(screen.getByText(/diagnosis.title/));

    expect(screen.getByText(/\/dashboards\/1024/)).toBeTruthy();
  });

  it('offers retry only when a retry handler is given', () => {
    const { rerender } = render(<PageError status={500} />);
    expect(screen.queryByText('action.retry')).toBeNull();

    rerender(<PageError status={500} onRetry={jest.fn()} />);
    expect(screen.getByText('action.retry')).toBeTruthy();
  });
});
