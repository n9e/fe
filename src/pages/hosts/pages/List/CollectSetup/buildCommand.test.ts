import { buildCollectCommand, buildManualCollectCommand, toBase64 } from './buildCommand';

describe('toBase64', () => {
  it('encodes ascii toml', () => {
    expect(toBase64('a = 1')).toBe(Buffer.from('a = 1', 'utf8').toString('base64'));
  });

  it('handles non-latin1 content that would break bare btoa', () => {
    const content = 'labels = { instance="生产库" }';
    expect(toBase64(content)).toBe(Buffer.from(content, 'utf8').toString('base64'));
  });
});

describe('buildCollectCommand', () => {
  const options = {
    serverAddr: 'http://10.1.1.1:17000',
    input: 'mysql',
    toml: '[[instances]]\naddress = "127.0.0.1:3306"\n',
  } as const;

  it('builds the bash -s -- form with quoted base64 payload', () => {
    const cmd = buildCollectCommand({ ...options });
    expect(cmd).toBe(
      `curl -sSfL 'http://10.1.1.1:17000/api/n9e/agents/categraf/collect.sh' | sudo bash -s -- --input 'mysql' --conf-b64 '${toBase64(options.toml)}'`,
    );
  });

  it('adds curl basic auth but no server-side auth flag', () => {
    const cmd = buildCollectCommand({ ...options, basicAuthUser: 'user', basicAuthPass: "pa's" });
    expect(cmd).toContain(`-u 'user:pa'\\''s'`);
    expect(cmd).not.toContain('--auth');
  });

  it('returns empty string without addr or toml', () => {
    expect(buildCollectCommand({ ...options, serverAddr: '' })).toBe('');
    expect(buildCollectCommand({ ...options, toml: '  ' })).toBe('');
  });
});

describe('buildManualCollectCommand', () => {
  it('downloads, reviews, then runs with the same arguments', () => {
    const cmd = buildManualCollectCommand({
      serverAddr: 'http://10.1.1.1:17000',
      input: 'redis',
      toml: 'x = 1\n',
    });
    const lines = cmd.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('-o collect-config.sh');
    expect(lines[1]).toBe('less collect-config.sh');
    expect(lines[2]).toContain(`sudo bash collect-config.sh --input 'redis'`);
  });
});
