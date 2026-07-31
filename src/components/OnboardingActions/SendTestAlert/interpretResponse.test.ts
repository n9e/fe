import { interpretTestSendResponse } from './interpretResponse';

describe('interpretTestSendResponse', () => {
  it('treats the bare "success" (empty provider body, e.g. smtp) as sent without detail', () => {
    expect(interpretTestSendResponse('success')).toEqual({ ok: true });
    expect(interpretTestSendResponse('')).toEqual({ ok: true });
    expect(interpretTestSendResponse(undefined)).toEqual({ ok: true });
  });

  it('flags a dingtalk/wecom business failure hidden behind HTTP 200', () => {
    // 钉钉安全关键词不匹配的真实形态：HTTP 层成功、errcode 非零
    const dat = 'status_code:200, response:{"errcode":310000,"errmsg":"keywords not in content"}';
    expect(interpretTestSendResponse(dat)).toEqual({ ok: false, detail: dat });
  });

  it('keeps errcode 0 as sent and carries the raw response for the user to see', () => {
    const dat = 'status_code:200, response:{"errcode":0,"errmsg":"ok"}';
    expect(interpretTestSendResponse(dat)).toEqual({ ok: true, detail: dat });
  });

  it('stays conservative on non-errcode conventions — a custom webhook may use code:200 for success', () => {
    const dat = 'status_code:200, response:{"code":2,"msg":"invalid token"}';
    // 宁可少报失败也不误杀：这类响应按已发出处理，原文展示给用户自行判断
    expect(interpretTestSendResponse(dat)).toEqual({ ok: true, detail: dat });
  });

  it('tolerates a non-JSON provider body', () => {
    const dat = 'status_code:200, response:ok';
    expect(interpretTestSendResponse(dat)).toEqual({ ok: true, detail: dat });
  });

  it('parses a body that is itself the whole dat when the backend format ever changes', () => {
    expect(interpretTestSendResponse('{"errcode":93000,"errmsg":"invalid webhook url"}')).toEqual({
      ok: false,
      detail: '{"errcode":93000,"errmsg":"invalid webhook url"}',
    });
  });
});
