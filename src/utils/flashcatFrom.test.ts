import { withFlashcatFrom, initFlashcatFrom } from './flashcatFrom';

const listeners: Record<string, (e: any) => void> = {};

beforeAll(() => {
  (global as any).window = { location: { href: 'http://localhost:17000/dashboards' } };
  (global as any).document = {
    addEventListener: (type: string, fn: (e: any) => void) => {
      listeners[type] = fn;
    },
  };
});

afterAll(() => {
  delete (global as any).window;
  delete (global as any).document;
});

describe('withFlashcatFrom', () => {
  it('appends from=n9e-user to flashcat.cloud and console links', () => {
    expect(withFlashcatFrom('https://flashcat.cloud')).toBe('https://flashcat.cloud/?from=n9e-user');
    expect(withFlashcatFrom('https://flashcat.cloud/product/flashduty/')).toBe('https://flashcat.cloud/product/flashduty/?from=n9e-user');
    expect(withFlashcatFrom('https://console.flashcat.cloud/settings/source/alert/add/n9e')).toBe(
      'https://console.flashcat.cloud/settings/source/alert/add/n9e?from=n9e-user',
    );
  });

  it('preserves existing query and hash', () => {
    expect(withFlashcatFrom('https://flashcat.cloud/media/?type=夜莺监控&source=abc')).toBe(
      'https://flashcat.cloud/media/?type=夜莺监控&source=abc&from=n9e-user',
    );
    expect(withFlashcatFrom('https://flashcat.cloud/docs/content/flashcat/log/xx/?onlyContent&theme=dark#2-时间宏')).toBe(
      'https://flashcat.cloud/docs/content/flashcat/log/xx/?onlyContent&theme=dark&from=n9e-user#2-时间宏',
    );
    expect(withFlashcatFrom('https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc/#step1')).toBe(
      'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc/?from=n9e-user#step1',
    );
  });

  it('appends from=v9-n9e-user to n9e.github.io links', () => {
    expect(withFlashcatFrom('https://n9e.github.io/')).toBe('https://n9e.github.io/?from=v9-n9e-user');
    expect(withFlashcatFrom('https://n9e.github.io/docs/security/sso?onlyContent&theme=dark#cas')).toBe(
      'https://n9e.github.io/docs/security/sso?onlyContent&theme=dark&from=v9-n9e-user#cas',
    );
  });

  it('keeps links that already carry a from param', () => {
    expect(withFlashcatFrom('https://flashcat.cloud/?from=custom')).toBe('https://flashcat.cloud/?from=custom');
  });

  it('leaves non-target hosts and ENT relative paths unchanged', () => {
    expect(withFlashcatFrom('https://github.com/ccfos/nightingale')).toBe('https://github.com/ccfos/nightingale');
    expect(withFlashcatFrom('https://download.flashcat.cloud/n9e.tar.gz')).toBe('https://download.flashcat.cloud/n9e.tar.gz');
    expect(withFlashcatFrom('/docs/content/flashcat-monitor/nightingale-v9/')).toBe('/docs/content/flashcat-monitor/nightingale-v9/');
  });
});

describe('initFlashcatFrom', () => {
  it('rewrites anchor href on click before navigation', () => {
    initFlashcatFrom();
    const link = { href: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/prologue/introduction/', dataset: {} as Record<string, string> };
    const event = { target: { closest: () => link } };
    listeners.click(event);
    expect(link.href).toBe('https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/prologue/introduction/?from=n9e-user');
  });

  it('redirects mapped docs to n9e.github.io for non-Chinese languages', () => {
    let language = 'en_US';
    initFlashcatFrom({ getLanguage: () => language });
    const link = { href: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines_en/', dataset: {} as Record<string, string> };
    listeners.click({ target: { closest: () => link } });
    expect(link.href).toBe('https://n9e.github.io/docs/events/pipelines?from=v9-n9e-user');

    language = 'zh_CN';
    const zhLink = { href: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/', dataset: {} as Record<string, string> };
    listeners.click({ target: { closest: () => zhLink } });
    expect(zhLink.href).toBe('https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/?from=n9e-user');
  });

  it('restores the original doc link after switching back to Chinese', () => {
    let language = 'en_US';
    initFlashcatFrom({ getLanguage: () => language });
    const original = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/';
    const link = { href: original, dataset: {} as Record<string, string> };
    listeners.click({ target: { closest: () => link } });
    expect(link.href).toBe('https://n9e.github.io/docs/events/pipelines?from=v9-n9e-user');

    language = 'zh_CN';
    listeners.click({ target: { closest: () => link } });
    expect(link.href).toBe(`${original}?from=n9e-user`);

    language = 'en_US';
    listeners.click({ target: { closest: () => link } });
    expect(link.href).toBe('https://n9e.github.io/docs/events/pipelines?from=v9-n9e-user');
  });

  it('treats an href updated by React as the new original', () => {
    initFlashcatFrom({ getLanguage: () => 'zh_CN' });
    const link = { href: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/', dataset: {} as Record<string, string> };
    listeners.click({ target: { closest: () => link } });
    link.href = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usecase/subscribe/';
    listeners.click({ target: { closest: () => link } });
    expect(link.href).toBe('https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usecase/subscribe/?from=n9e-user');
  });

  it('does not redirect to n9e.github.io in ENT', () => {
    initFlashcatFrom({ getLanguage: () => 'en_US', isEnt: true });
    const link = { href: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/', dataset: {} as Record<string, string> };
    listeners.click({ target: { closest: () => link } });
    expect(link.href).toBe('https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/?from=n9e-user');
  });

  it('ignores clicks outside target links', () => {
    const event = { target: { closest: () => null } };
    expect(() => listeners.mousedown(event)).not.toThrow();
  });
});
