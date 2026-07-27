/**
 * 快捷创建通知规则 — Webhook URL 识别逻辑测试
 * 只测纯解析函数；服务层与 i18n 依赖全部 mock。
 */
jest.mock('i18next', () => ({
  __esModule: true,
  default: {
    t: (key: string, options?: Record<string, unknown>) => {
      const k = String(key);
      return options && 'key' in options ? `${k}:${options.key}` : k;
    },
  },
}));

jest.mock('@/pages/notificationChannels/constants', () => ({
  __esModule: true,
  getNotificationChannelTypes: () => ({}),
}));

jest.mock('@/pages/notificationChannels/services', () => ({
  __esModule: true,
  getItems: jest.fn(),
  getSimplifiedItems: jest.fn(),
  postItems: jest.fn(),
}));

jest.mock('@/pages/notificationTemplates/services', () => ({
  __esModule: true,
  getItems: jest.fn(),
}));

jest.mock('../../services', () => ({
  __esModule: true,
  getItems: jest.fn(),
  postItems: jest.fn(),
}));

import { parseWebhookInput, tryParseWebhookInput, suggestQuickRuleName } from './quickCreate';

describe('parseWebhookInput', () => {
  it('识别钉钉机器人（token 在 query）', () => {
    const parsed = parseWebhookInput('https://oapi.dingtalk.com/robot/send?access_token=abcd1234');
    expect(parsed).toMatchObject({ ident: 'dingtalk', paramKey: 'access_token', token: 'abcd1234' });
  });

  it('识别企微机器人（key 在 query）', () => {
    const parsed = parseWebhookInput('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=wx-key-5678');
    expect(parsed).toMatchObject({ ident: 'wecom', paramKey: 'key', token: 'wx-key-5678' });
  });

  it('识别飞书卡片（token 在 path 末段）', () => {
    const parsed = parseWebhookInput('https://open.feishu.cn/open-apis/bot/v2/hook/fs-token-90ab');
    expect(parsed).toMatchObject({ ident: 'feishucard', paramKey: 'access_token', token: 'fs-token-90ab' });
  });

  it('识别 Lark 卡片，并容忍尾部斜杠', () => {
    const parsed = parseWebhookInput('https://open.larksuite.com/open-apis/bot/v2/hook/lark-token-cdef/');
    expect(parsed).toMatchObject({ ident: 'larkcard', paramKey: 'token', token: 'lark-token-cdef' });
  });

  it('识别官方云 Flashduty 集成地址', () => {
    const url = 'https://api.flashcat.cloud/event/push/alert/n9e?integration_key=fd-key-1234';
    const parsed = parseWebhookInput(url);
    expect(parsed).toMatchObject({ ident: 'flashduty', token: 'fd-key-1234', integrationUrl: url });
  });

  it('识别自建 Flashduty（任意域名，按路径特征）', () => {
    const url = 'https://duty.example.com/event/push/alert/n9e?integration_key=self-host-key';
    const parsed = parseWebhookInput(url);
    expect(parsed).toMatchObject({ ident: 'flashduty', token: 'self-host-key' });
  });

  it('Flashduty 判定优先于 IM 识别', () => {
    // flashcat.cloud 域名 + integration_key，即使不含 /event/push 路径也按 Flashduty 处理
    const parsed = parseWebhookInput('https://api.flashcat.cloud/some/path?integration_key=k1');
    expect(parsed.ident).toBe('flashduty');
  });

  it('清理粘贴时带的中英文尾部标点', () => {
    const parsed = parseWebhookInput('https://oapi.dingtalk.com/robot/send?access_token=abcd1234，');
    expect(parsed.token).toBe('abcd1234');
  });

  it('钉钉缺 access_token 时报缺参错误', () => {
    expect(() => parseWebhookInput('https://oapi.dingtalk.com/robot/send')).toThrow(/missing_param/);
  });

  it('Flashduty 缺 integration_key 时报缺参错误', () => {
    expect(() => parseWebhookInput('https://api.flashcat.cloud/event/push/alert/n9e')).toThrow(/missing_param/);
  });

  it('非 URL 输入报格式错误', () => {
    expect(() => parseWebhookInput('not a url')).toThrow(/invalid_url/);
  });

  it('无法识别的 webhook 域名报不支持错误', () => {
    expect(() => parseWebhookInput('https://hooks.slack.com/services/T00/B00/xxx')).toThrow(/unrecognized/);
  });
});

describe('tryParseWebhookInput', () => {
  it('成功时返回 ok=true 与解析结果', () => {
    const result = tryParseWebhookInput('https://oapi.dingtalk.com/robot/send?access_token=abcd1234');
    expect(result.ok).toBe(true);
  });

  it('失败时返回 ok=false 与错误文案，不抛异常', () => {
    const result = tryParseWebhookInput('https://example.com/unknown');
    expect(result).toMatchObject({ ok: false });
  });
});

describe('suggestQuickRuleName', () => {
  it('按「渠道名-token 尾 4 位」生成默认名', () => {
    expect(suggestQuickRuleName('https://oapi.dingtalk.com/robot/send?access_token=abcd1234')).toBe('Dingtalk-1234');
    expect(suggestQuickRuleName('https://api.flashcat.cloud/event/push/alert/n9e?integration_key=fd-key-90ab')).toBe('FlashDuty-90ab');
  });

  it('token 不足 4 位时使用完整 token', () => {
    expect(suggestQuickRuleName('https://oapi.dingtalk.com/robot/send?access_token=ab')).toBe('Dingtalk-ab');
  });

  it('无法识别时返回 null，不打断输入', () => {
    expect(suggestQuickRuleName('whatever')).toBeNull();
    expect(suggestQuickRuleName('')).toBeNull();
  });
});
