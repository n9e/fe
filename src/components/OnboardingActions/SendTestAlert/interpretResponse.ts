/**
 * 把 /notify-rule/test 的响应整理成可读文本，**不判断业务结果**。
 *
 * 后端对 HTTP 200 一律判成功（alert/sender/provider/http_common.go 不解析响应体），而各家 IM
 * 在 token 失效、安全关键词不匹配时恰恰返回 HTTP 200 + 各自不同的业务码：钉钉/企微用 errcode，
 * 飞书/Lark 用 StatusCode 或 code，自定义 HTTP 渠道还可能用 code:200 表示成功。在前端复刻这张
 * 「每家渠道的错误码方言表」注定追不上新增渠道，且猜错的代价是给用户一个假的绿勾。
 *
 * 所以这里只做展示层整形：能解析成 JSON 就格式化，让 errcode / StatusCode / code 一眼可见，
 * 由用户对照聊天群或邮箱确认是否真的收到 —— 这也正是 test.sent_hint 一直在说的话。
 *
 * dat 的形态（见 center/router/router_notify_rule.go 的 notifyTest）：
 * - "success"：provider 无响应体（如 smtp 同步发送成功），无内容可展示，返回 undefined
 * - "status_code:200, response:{...}"：http 类渠道对 provider 响应的原样转发
 */
export function formatTestSendResponse(dat: unknown): string | undefined {
  if (typeof dat !== 'string' || dat === '' || dat === 'success') {
    return undefined;
  }
  const marker = 'response:';
  const markerIndex = dat.indexOf(marker);
  const body = (markerIndex >= 0 ? dat.slice(markerIndex + marker.length) : dat).trim();
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch (e) {
    // 响应体不是 JSON（也可能是后端换了包装格式）：原样给出，不做任何加工
    return dat;
  }
}
