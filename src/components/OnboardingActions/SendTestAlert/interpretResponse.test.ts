import { formatTestSendResponse } from './interpretResponse';

describe('formatTestSendResponse', () => {
  it('returns nothing to show when the provider had no response body (e.g. smtp)', () => {
    expect(formatTestSendResponse('success')).toBeUndefined();
    expect(formatTestSendResponse('')).toBeUndefined();
    expect(formatTestSendResponse(undefined)).toBeUndefined();
  });

  it('pretty-prints the provider body so a dingtalk/wecom errcode is visible at a glance', () => {
    // 钉钉安全关键词不匹配的真实形态：HTTP 层成功、errcode 非零
    const dat = 'status_code:200, response:{"errcode":310000,"errmsg":"keywords not in content"}';
    expect(formatTestSendResponse(dat)).toBe(JSON.stringify({ errcode: 310000, errmsg: 'keywords not in content' }, null, 2));
  });

  it('pretty-prints a feishu/lark StatusCode the same way — no per-channel dialect table', () => {
    // 飞书机器人 token 失效：同样是 HTTP 200，业务码字段却叫 StatusCode
    const dat = 'status_code:200, response:{"StatusCode":19024,"StatusMessage":"token invalid"}';
    expect(formatTestSendResponse(dat)).toBe(JSON.stringify({ StatusCode: 19024, StatusMessage: 'token invalid' }, null, 2));
  });

  it('does not judge success or failure — a zero errcode gets the same treatment', () => {
    const dat = 'status_code:200, response:{"errcode":0,"errmsg":"ok"}';
    expect(formatTestSendResponse(dat)).toBe(JSON.stringify({ errcode: 0, errmsg: 'ok' }, null, 2));
  });

  it('tolerates a non-JSON provider body', () => {
    const dat = 'status_code:200, response:ok';
    expect(formatTestSendResponse(dat)).toBe(dat);
  });

  it('parses a body that is itself the whole dat when the backend format ever changes', () => {
    expect(formatTestSendResponse('{"errcode":93000,"errmsg":"invalid webhook url"}')).toBe(
      JSON.stringify({ errcode: 93000, errmsg: 'invalid webhook url' }, null, 2),
    );
  });
});
