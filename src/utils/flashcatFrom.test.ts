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
      `https://flashcat.cloud/media/?type=${encodeURIComponent('夜莺监控')}&source=abc&from=n9e-user`,
    );
    expect(withFlashcatFrom('https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc/#step1')).toBe(
      'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc/?from=n9e-user#step1',
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
    const link = { href: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/prologue/introduction/' };
    const event = { target: { closest: () => link } };
    listeners.click(event);
    expect(link.href).toBe('https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/prologue/introduction/?from=n9e-user');
  });

  it('ignores clicks outside target links', () => {
    const event = { target: { closest: () => null } };
    expect(() => listeners.mousedown(event)).not.toThrow();
  });
});
