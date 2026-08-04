jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: actual,
    ...actual,
  };
});

import { extractTplKeysFromBody, getExpectedTplKeys, buildStarterContent, SMTP_TPL_KEYS, StarterTexts } from './tplKeys';
import { normalizeFormValues } from '@/pages/notificationChannels/utils/normalizeValues';

const TEXTS = {
  ruleName: '规则',
  severity: '级别',
  status: '状态',
  firing: '触发',
  recovered: '恢复',
  tags: '标签',
  triggerValue: '触发值',
  time: '时间',
  detail: '详情',
} satisfies StarterTexts;

// 取自 constants.ts 里 dingtalk 的真实默认 body
const DINGTALK_BODY =
  '{"msgtype": "markdown", "markdown": {"title": "{{$tpl.title}}", "text": "{{$tpl.content}}\\n{{batchContactsAts $sendtos}}"}, "at": {"atMobiles": {{batchContactsJsonMarshal $sendtos}} }}';

describe('extractTplKeysFromBody', () => {
  it('抽出钉钉 body 里引用的模板字段', () => {
    expect(extractTplKeysFromBody(DINGTALK_BODY)).toEqual(['title', 'content']);
  });

  it('兼容带空格的写法', () => {
    expect(extractTplKeysFromBody('{{ $tpl.title }} {{$tpl.content}}')).toEqual(['title', 'content']);
  });

  it('重复引用只算一次，且保持出现顺序', () => {
    expect(extractTplKeysFromBody('{{$tpl.content}} {{$tpl.title}} {{$tpl.content}}')).toEqual(['content', 'title']);
  });

  it('不把 $event 引用误当成模板字段', () => {
    expect(extractTplKeysFromBody('{{$event.RuleName}} {{$tpl.title}}')).toEqual(['title']);
  });

  it('body 为空或无引用时返回空数组', () => {
    expect(extractTplKeysFromBody(undefined)).toEqual([]);
    expect(extractTplKeysFromBody('')).toEqual([]);
    expect(extractTplKeysFromBody('{"text": "no refs"}')).toEqual([]);
  });

  it('多次调用结果一致（正则 lastIndex 不残留）', () => {
    expect(extractTplKeysFromBody(DINGTALK_BODY)).toEqual(extractTplKeysFromBody(DINGTALK_BODY));
  });
});

describe('getExpectedTplKeys', () => {
  it('http 类型从 body 推导', () => {
    const channel = {
      request_type: 'http',
      request_config: { http_request_config: { request: { body: DINGTALK_BODY } } },
    } as const;

    expect(getExpectedTplKeys(channel)).toEqual({ keys: ['title', 'content'], source: 'body' });
  });

  // 后端在 body / URL / headers / parameters 四处都注入了 {{$tpl := .tpl}}
  // （alert/sender/provider/http_common.go 的 parseRequestBody 与 replaceVariables），
  // 只扫 body 会让「正文放在 header 里」的媒介推不出字段，起步内容为空
  it('header / URL / query 里的 $tpl 引用同样能推导出来', () => {
    const channel = {
      request_type: 'http',
      request_config: {
        http_request_config: {
          url: 'https://example.com/hook?t={{$tpl.token}}',
          headers: { 'X-Content': '{{$tpl.content}}' },
          request: { parameters: { subject: '{{$tpl.subject}}' } },
        },
      },
    } as const;

    expect(getExpectedTplKeys(channel).keys.sort()).toEqual(['content', 'subject', 'token']);
  });

  it('body 与 header 引用同一字段时不重复，且 body 的字段排在前面', () => {
    const channel = {
      request_type: 'http',
      request_config: {
        http_request_config: {
          headers: { 'X-Content': '{{$tpl.content}}', 'X-Extra': '{{$tpl.extra}}' },
          request: { body: DINGTALK_BODY },
        },
      },
    } as const;

    expect(getExpectedTplKeys(channel).keys).toEqual(['title', 'content', 'extra']);
  });

  // ChannelItem 把 headers 声明成表单态的 {key,value}[]，而按 id 查回来的是接口态的 map，
  // 两种形态都会被传进来，都得取到值
  it('表单态的 headers（{key,value}[]）同样能推导', () => {
    const channel = {
      request_type: 'http',
      request_config: {
        http_request_config: {
          headers: [{ key: 'X-Content', value: '{{$tpl.content}}' }],
        },
      },
    } as const;

    expect(getExpectedTplKeys(channel).keys).toEqual(['content']);
  });

  it('smtp 没有 HTTP body，走固定字段', () => {
    expect(getExpectedTplKeys({ request_type: 'smtp' })).toEqual({ keys: SMTP_TPL_KEYS, source: 'fixed' });
  });

  it('flashduty / pagerduty 不需要模板', () => {
    expect(getExpectedTplKeys({ request_type: 'flashduty' })).toEqual({ keys: [], source: 'none' });
    expect(getExpectedTplKeys({ request_type: 'pagerduty' })).toEqual({ keys: [], source: 'none' });
  });

  it('script 字段无法推导，返回空但不宣称「不需要模板」', () => {
    expect(getExpectedTplKeys({ request_type: 'script' })).toEqual({ keys: [], source: 'body' });
  });

  it('channel 缺失时不抛异常', () => {
    expect(getExpectedTplKeys(undefined)).toEqual({ keys: [], source: 'body' });
  });

  // 后端按 ident 查的 /notify-channel-config 会在返回前把 RequestConfig 显式置空
  // （router_notify_channel.go:186-187），simplified 列表接口也不返回它。
  // 拿这种「壳子」去推导 http 媒介的字段只会得到空集，起步内容就成了空的——
  // 必须用按 id 查的 /notify-channel-config/:id。这里把两种形态的差异钉住。
  it('request_config 被后端置空时，http 推不出字段（说明必须用按 id 查的完整配置）', () => {
    const blanked = { request_type: 'http', request_config: {} } as const;
    expect(getExpectedTplKeys(blanked)).toEqual({ keys: [], source: 'body' });
    expect(buildStarterContent(blanked, TEXTS)).toEqual({});
  });

  it('request_config 被置空时 smtp 仍然可用（固定字段不依赖 body）', () => {
    const blanked = { request_type: 'smtp', request_config: {} } as const;
    expect(getExpectedTplKeys(blanked).keys).toEqual(SMTP_TPL_KEYS);
  });

  it('smtp 返回的是副本，调用方改动不污染后续调用', () => {
    const first = getExpectedTplKeys({ request_type: 'smtp' });
    first.keys.push('injected');
    expect(getExpectedTplKeys({ request_type: 'smtp' }).keys).toEqual(['subject', 'content']);
  });
});

// 媒介测试弹窗是先 normalizeFormValues 再 getExpectedTplKeys 的。
// 一旦 normalize 把 request.body 弄丢，这里会返回空字段集 -> 前端不传 tpl_content
// -> 后端直接 400 "tpl_content required"，表现为「钉钉的测试按钮永远报错」。
describe('与 normalizeFormValues 的契约', () => {
  it('表单态经 normalizeFormValues 后仍能推导出模板字段', () => {
    // 表单态：headers / parameters 是 {key,value}[]，与接口态的 map 不同
    const formValues = {
      name: 'dingtalk',
      ident: 'dingtalk',
      request_type: 'http',
      request_config: {
        http_request_config: {
          url: 'https://oapi.dingtalk.com/robot/send',
          method: 'POST',
          headers: [{ key: 'Content-Type', value: 'application/json' }],
          request: {
            parameters: [{ key: 'access_token', value: '{{$params.access_token}}' }],
            body: DINGTALK_BODY,
          },
        },
      },
    };

    const normalized = normalizeFormValues(formValues as any);

    expect(normalized.request_config.http_request_config.request.body).toBe(DINGTALK_BODY);
    expect(getExpectedTplKeys(normalized)).toEqual({ keys: ['title', 'content'], source: 'body' });
    expect(Object.keys(buildStarterContent(normalized, TEXTS))).toEqual(['title', 'content']);
  });
});

describe('buildStarterContent', () => {
  it('按 body 推导出的字段生成内容，标题字段只有一行', () => {
    const channel = {
      request_type: 'http',
      request_config: { http_request_config: { request: { body: DINGTALK_BODY } } },
    } as const;
    const content = buildStarterContent(channel, TEXTS);

    expect(Object.keys(content)).toEqual(['title', 'content']);
    expect(content.title).toBe('[S{{$event.Severity}}] {{$event.RuleName}}');
    expect(content.title).not.toContain('\n');
    expect(content.content).toContain('{{$event.RuleName}}');
    expect(content.content).toContain('{{if $event.IsRecovered}}');
  });

  it('smtp 生成 subject + content，subject 是标题式的', () => {
    const content = buildStarterContent({ request_type: 'smtp' }, TEXTS);

    expect(Object.keys(content)).toEqual(['subject', 'content']);
    expect(content.subject).not.toContain('\n');
  });

  it('不需要模板的媒介返回空对象', () => {
    expect(buildStarterContent({ request_type: 'flashduty' }, TEXTS)).toEqual({});
  });

  it('相同入参多次调用结果一致（幂等性）', () => {
    const channel = { request_type: 'smtp' } as const;
    expect(buildStarterContent(channel, TEXTS)).toEqual(buildStarterContent(channel, TEXTS));
  });
});
