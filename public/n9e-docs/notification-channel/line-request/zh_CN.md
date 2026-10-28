# LINE

通过 LINE 官方账号（Messaging API）把告警发给用户、群组或多人聊天。LINE Notify 已于 2025 年 3 月停止服务，现在只能使用 Messaging API。Channel Access Token 在媒介里配置，接收方 ID 在通知规则里填写。

## 准备

1. 用邮箱或 LINE 账号注册 [LINE Business ID](https://account.line.biz/signup)，并在 [LINE Developers Console](https://developers.line.biz/console/) 完成开发者注册。
2. 创建 LINE 官方账号：现在不能在 Developers Console 里直接新建 Messaging API Channel，要先在 [LINE Official Account Manager](https://manager.line.biz/) 创建官方账号。**用新的 Business ID 创建官方账号时需要手机短信验证。**
3. 在 Official Account Manager 里打开这个账号的 **设置 → Messaging API**，点 **启用 Messaging API** 并选择一个 Provider，Developers Console 里随之出现对应的 Channel。
4. 在 Developers Console 里打开这个 Channel 的 **Messaging API** 页签，签发 **Channel access token (long-lived)**。
5. 让接收人用手机 LINE 扫 **Messaging API** 页签上的二维码，把官方账号加为好友；要发到群组，把官方账号邀请进群（需在官方账号的设置里允许加入群组）。
6. 获取接收方 ID：自己的用户 ID 在 Channel 的 **Basic settings → Your user ID**；其他用户和群组的 ID 来自 Webhook 事件里的 `source.userId` / `source.groupId`。ID 以 `U`（用户）、`C`（群组）或 `R`（多人聊天）开头，后跟 32 位十六进制字符，**不是** LINE App 里显示的 LINE ID。

## 添加媒介

在 **告警通知 → 通知媒介** 左侧选择 **LINE**。

<img width='60%' src='/n9e-docs/notification-channel/line-request/types.zh_CN.png' />

<img width='100%' src='/n9e-docs/notification-channel/line-request/form.zh_CN.png' />

- **Channel access token**：支持 `{{.变量名}}` 引用变量配置。
- **高级设置**：接口地址、代理、超时和重试。夜莺所在网络访问不了 `api.line.me` 时，在这里配置代理；媒介只使用这里配置的代理，不读取 `https_proxy` 等环境变量。

保存前可以点 **测试**，填一个接收方 ID 真实发送一条消息。

## 在通知规则中使用

<img width='100%' src='/n9e-docs/notification-channel/line-request/rule.zh_CN.png' />

- **接收方 ID**：用户、群组或多人聊天的 ID；支持 `{{.变量名}}`。
- **名称**：用于通知记录展示和历史参数复用；不填时记录里只显示 ID 的后 4 位。
- **消息模板**：选择 LINE 模板，正文键为 `content`，纯文本。

## 收到的效果

消息是一条文本：带级别符号的标题、渲染后的模板和事件详情链接，超过 5000 个字符会截断正文、保留链接。每次通知带一个重试标识，超时或服务端错误后的重试不会重复投递。

## 排查

- 401 `Authentication failed`：Channel Access Token 不对或已过期，重新签发。
- `Failed to send messages`：接收方 ID 不对，或该用户还没有加官方账号为好友、官方账号不在该群组里。
- `You have reached your monthly limit.`：官方账号当月的消息额度已用完（推送消息计入额度，免费额度因地区和套餐而异）。
- 超时或「无法访问 LINE」：检查网络，必要时在高级设置里配置代理。

参考：[发送推送消息](https://developers.line.biz/en/reference/messaging-api/#send-push-message)、[获取用户 ID](https://developers.line.biz/en/docs/messaging-api/getting-user-ids/)。
