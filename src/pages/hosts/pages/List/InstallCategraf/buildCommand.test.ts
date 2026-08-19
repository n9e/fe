import { buildInstallCommand, buildManualCommand, pickDefaultServerAddr } from './buildCommand';

// jest 跑在 node 环境，normalizeServerAddr 会读 window.location.protocol 给
// 无协议的输入补协议，所以这里得给个最小 window
beforeAll(() => {
  (global as any).window = { location: { protocol: 'https:' } };
});

describe('pickDefaultServerAddr', () => {
  // issue #3330：nginx 的 `proxy_set_header Host $host` 不带端口，服务端据此推出的
  // base_url 就少了端口，装机命令里三处地址跟着一起错
  it('takes the port from the browser when the proxy dropped it', () => {
    expect(
      pickDefaultServerAddr({
        metaBaseURL: 'https://n9e.example.com',
        origin: 'https://n9e.example.com:10443',
      }),
    ).toBe('https://n9e.example.com:10443');
  });

  // 漏配 X-Forwarded-Proto 时服务端推成 http，同样以浏览器为准
  it('takes the scheme from the browser when X-Forwarded-Proto is missing', () => {
    expect(
      pickDefaultServerAddr({
        metaBaseURL: 'http://n9e.example.com:10443',
        origin: 'https://n9e.example.com:10443',
      }),
    ).toBe('https://n9e.example.com:10443');
  });

  // origin 里没有路径，只借 protocol+host，子路径反代不能被抹掉
  it('keeps the reverse-proxy sub-path while fixing protocol and port', () => {
    expect(
      pickDefaultServerAddr({
        metaBaseURL: 'https://n9e.example.com/n9e',
        origin: 'https://n9e.example.com:10443',
      }),
    ).toBe('https://n9e.example.com:10443/n9e');
  });

  // hostname 不同 = 运维刻意配的对外地址，浏览器地址不能覆盖它
  it('keeps a deliberately different host untouched', () => {
    expect(
      pickDefaultServerAddr({
        metaBaseURL: 'https://agent-gw.example.com:8443',
        origin: 'https://console.example.com',
      }),
    ).toBe('https://agent-gw.example.com:8443');
  });

  it('leaves an already-correct base_url alone', () => {
    expect(
      pickDefaultServerAddr({
        metaBaseURL: 'https://n9e.example.com:10443',
        origin: 'https://n9e.example.com:10443',
      }),
    ).toBe('https://n9e.example.com:10443');
  });

  // site_url 是管理员手填的，端口就算和浏览器不一致也照原样用
  it('never rewrites an admin-configured site_url', () => {
    expect(
      pickDefaultServerAddr({
        siteURL: 'https://n9e.example.com',
        origin: 'https://n9e.example.com:10443',
      }),
    ).toBe('https://n9e.example.com');
  });

  it('falls back to site_url, then to the browser origin', () => {
    expect(pickDefaultServerAddr({ siteURL: 'http://other.example.com:17000', origin: 'https://n9e.example.com:10443' })).toBe(
      'http://other.example.com:17000',
    );
    expect(pickDefaultServerAddr({ origin: 'https://n9e.example.com:10443' })).toBe('https://n9e.example.com:10443');
    expect(pickDefaultServerAddr({})).toBe('');
  });

  it('drops a trailing slash', () => {
    expect(pickDefaultServerAddr({ metaBaseURL: 'https://n9e.example.com:10443/', origin: 'https://n9e.example.com:10443' })).toBe(
      'https://n9e.example.com:10443',
    );
  });
});

describe('buildInstallCommand', () => {
  const addr = 'https://n9e.example.com:10443';

  // --download-base 是 issue #3330 的第三处：脚本里的 DOWNLOAD_BASE 由服务端渲染，
  // 推错时内网下载必失败且用户无从补救，所以命令里显式带上它
  it('pins the download source to the address shown in the UI', () => {
    expect(buildInstallCommand({ serverAddr: addr })).toBe(
      `curl -sSfL '${addr}/api/n9e/agents/categraf/install.sh' | sudo bash -s -- --server '${addr}' --download-base '${addr}'`,
    );
  });

  it('appends auth after the address flags', () => {
    const cmd = buildInstallCommand({ serverAddr: addr, basicAuthUser: 'u', basicAuthPass: 'p' });
    expect(cmd).toBe(
      `curl -sSfL -u 'u:p' '${addr}/api/n9e/agents/categraf/install.sh' | sudo bash -s -- --server '${addr}' --download-base '${addr}' --auth 'u:p'`,
    );
  });

  it('returns empty for an unusable address', () => {
    expect(buildInstallCommand({ serverAddr: '  ' })).toBe('');
  });
});

describe('buildManualCommand', () => {
  it('carries the same download source as the piped form', () => {
    const addr = 'https://n9e.example.com:10443';
    expect(buildManualCommand({ serverAddr: addr })).toBe(
      [
        `curl -sSfL '${addr}/api/n9e/agents/categraf/install.sh' -o install-categraf.sh`,
        'less install-categraf.sh',
        `sudo bash install-categraf.sh --server '${addr}' --download-base '${addr}'`,
      ].join('\n'),
    );
  });
});
