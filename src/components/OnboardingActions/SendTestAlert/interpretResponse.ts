import _ from 'lodash';

export interface TestSendOutcome {
  ok: boolean;
  /** provider 原始响应；成功态也要展示，token / 安全关键词类问题全靠它露出来 */
  detail?: string;
}

/**
 * 解读 /notify-rule/test 的响应。
 *
 * 后端对 HTTP 200 一律判成功（alert/sender/provider/http_common.go 不解析响应体），
 * 而钉钉/企微机器人在 token 失效、安全关键词不匹配时恰恰返回 HTTP 200 + 非零 errcode。
 * 这里保守地补一层业务码识别：只认 `errcode` 字段（钉钉/企微的事实标准，0=成功），
 * 不猜 `code` 这类含义因渠道而异的字段（自定义 HTTP 渠道可能用 code:200 表示成功）。
 * 识别不出就按「已发出」处理并原样展示响应，由用户对照聊天群确认送达。
 *
 * dat 的形态（见 center/router/router_notify_rule.go 的 notifyTest）：
 * - "success"：provider 无响应体（如 smtp 同步发送成功）
 * - "status_code:200, response:{...}"：http 类渠道对 provider 响应的原样转发
 */
export function interpretTestSendResponse(dat: unknown): TestSendOutcome {
  if (!_.isString(dat) || dat === '' || dat === 'success') {
    return { ok: true };
  }
  const marker = 'response:';
  const markerIndex = dat.indexOf(marker);
  const body = (markerIndex >= 0 ? dat.slice(markerIndex + marker.length) : dat).trim();
  try {
    const errcode = JSON.parse(body)?.errcode;
    if (_.isNumber(errcode) && errcode !== 0) {
      return { ok: false, detail: dat };
    }
  } catch (e) {
    // 响应体不是 JSON：无从判断业务结果，按已发出处理
  }
  return { ok: true, detail: dat };
}
