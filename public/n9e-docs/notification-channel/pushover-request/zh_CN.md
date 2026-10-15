# Pushover

通过 [Pushover](https://pushover.net) 把告警推送到手机和桌面。应用的 API Token 在媒介里配置，接收通知的 User Key / Group Key 在通知规则里填写。

## 准备

1. 在 [pushover.net](https://pushover.net/signup) 注册账号并完成邮箱验证，**验证邮箱之前不能创建应用**。
2. 在 [pushover.net/apps/build](https://pushover.net/apps/build) 创建一个应用：填写名称（会显示在通知上），勾选同意条款后点 **Create Application**，应用页面上的 **API Token/Key**（30 位字母数字）就是媒介要填的 Token。账号下所有应用合计每月可免费发送 10000 条消息。

<img width='100%' src='/n9e-docs/notification-channel/pushover-request/vendor-create-app.png' />

3. 接收人在 Pushover 首页右上角可以看到自己的 **User Key**；要通知整个团队，创建一个 **Delivery Group**，使用它的 Group Key。
4. 接收人至少要有一台登录了 Pushover 的设备：iOS / Android App，或者浏览器里的 [桌面客户端](https://pushover.net/clients/desktop)。没有设备就收不到通知。客户端有 30 天试用，之后每个平台一次性付费。

## 添加媒介

在 **告警通知 → 通知媒介** 左侧选择 **Pushover**。

<img width='60%' src='/n9e-docs/notification-channel/pushover-request/types.zh_CN.png' />

<img width='100%' src='/n9e-docs/notification-channel/pushover-request/form.zh_CN.png' />

- **API Token**：应用的 Token；支持 `{{.变量名}}` 引用变量配置。
- **级别与优先级**：夜莺各告警级别对应的 Pushover 优先级，默认 S1→High（1）、S2/S3→Normal（0）。High 会绕过接收人的免打扰时段；Emergency（2）会重复提醒，直到有人在 App 里确认。
- **紧急提醒间隔 / 时长**：仅 Emergency 使用，间隔不少于 30 秒，时长不超过 10800 秒（3 小时）。
- **提示音**：如 `siren`、`pushover`，留空用接收人自己的默认设置。
- **高级设置**：接口地址、代理、超时和重试。

## 测试

点 **测试**，填一个 User Key，就会按当前表单（不必先保存）真实发送一条消息。

<img width='100%' src='/n9e-docs/notification-channel/pushover-request/test.zh_CN.png' />

<img width='100%' src='/n9e-docs/notification-channel/pushover-request/test-result.zh_CN.png' />

## 在通知规则中使用

在通知规则的通知配置里选择这个媒介和 Pushover 消息模板：

<img width='100%' src='/n9e-docs/notification-channel/pushover-request/rule.zh_CN.png' />

- **User Key / Group Key**：一个或多个 Key，逗号分隔（最多 50 个）；支持 `{{.变量名}}`。
- **名称**：用于通知记录展示和历史参数复用；不填时记录里只显示 Key 的后 4 位。
- **消息模板**：选择 Pushover 模板，正文键为 `content`，纯文本。

## 收到的效果

通知标题是「[S1] Triggered: 规则名」，正文是渲染后的模板（最多 1024 个字符），并带 **Event details** 链接。下图是 Emergency 级别的告警和它的恢复通知：

<img width='100%' src='/n9e-docs/notification-channel/pushover-request/vendor-delivered.png' />

恢复通知固定使用 Normal 优先级。级别映射到 Emergency 的告警恢复时，夜莺会先取消这条告警还在重复的紧急提醒，再发恢复通知。

## 排查

- `application token is invalid`：媒介里的 API Token 不对。
- `user identifier is not a valid user, group, or subscribed user key`：规则里的 Key 不对。
- HTTP 429：应用当月的消息额度已用完。按 Pushover 的要求，4xx 错误不会重试；服务端错误至少间隔 5 秒重试。

参考：[Pushover Message API](https://pushover.net/api)、[回执与取消](https://pushover.net/api/receipts)。
