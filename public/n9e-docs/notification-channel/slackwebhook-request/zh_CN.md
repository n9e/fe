# Slack Webhook 配置指南

通过 Slack 应用的 Incoming Webhook 发送告警。一个 Webhook 地址对应一个频道，地址填在通知规则里，所以同一个 Slack Webhook 媒介可以发到任意多个频道（和钉钉机器人的用法一致）。系统已内置一个名为 SlackWebhook 的媒介，一般无需新建。

## 创建 Webhook

1. 打开 https://api.slack.com/apps，点 **Create an App** → **From scratch**（或 **Blank app**），填应用名称、选择工作区
2. 在应用设置里打开 **Incoming Webhooks**，把 **Activate Incoming Webhooks** 打开
3. 点 **Add New Webhook**，选择要接收告警的频道并授权（私有频道需要你是成员）
4. 复制生成的地址，形如 `https://hooks.slack.com/services/T.../B.../...`

## 在通知规则里填写

| 字段 | 说明 |
|---|---|
| Webhook 地址 | 上一步复制的地址。它本身就是凭证，通知记录里会掩码显示。其他规则填过的地址，点输入框就能直接选（只显示名称和掩码），选中后整组参数一起填回 |
| 名称 | 给这个地址起个好认的名字，建议用频道名，通知记录和地址输入框的下拉里显示的都是它 |

## 媒介里的设置（可选）

只有代理、超时和重试。新版 Slack 应用的 Webhook 会忽略名称和图标的覆盖，消息发送者显示为应用的名称和图标，可以在应用设置的 **Basic Information → Display Information** 里修改。

## 常见问题

- **invalid_token**：地址里的 token 不对，请重新复制
- **no_service**：Webhook 已被移除或停用，请在 Incoming Webhooks 页面重新添加
- **channel_not_found / channel_is_archived**：Webhook 绑定的频道已被删除或归档
- **action_prohibited**：工作区管理员限制了向这个频道发消息
- **连接超时**：夜莺服务端访问不到 Slack，在媒介的高级设置里填写代理
- **429**：触发限速（每个频道约每秒 1 条），系统会按 Retry-After 自动重试
