# Mattermost Webhook 配置指南

通过 Mattermost 的 Incoming Webhook 发送告警。一个 Webhook 地址对应一个频道，地址填在通知规则里，所以同一个 Mattermost Webhook 媒介可以发到任意多个频道（和钉钉机器人的用法一致）。系统已内置一个名为 MattermostWebhook 的媒介，一般无需新建。

## 创建 Webhook

1. 确认管理员已在 **System Console → Integrations → Integration Management** 打开 **Enable incoming webhooks**（默认已开）
2. 在 Mattermost 左上角菜单打开 **Integrations** → **Incoming Webhooks** → **Add Incoming Webhook**
3. 填写标题，选择要接收告警的频道，保存
4. 复制生成的地址，形如 `https://mattermost.example.com/hooks/<id>`

## 在通知规则里填写

| 字段 | 说明 |
|---|---|
| Webhook 地址 | 上一步复制的地址。它本身就是凭证，通知记录里会掩码显示。其他规则填过的地址，点输入框就能直接选（只显示名称和掩码），选中后整组参数一起填回 |
| 名称 | 给这个地址起个好认的名字，建议用频道名，通知记录和地址输入框的下拉里显示的都是它 |

## 媒介里的设置（可选）

- **显示名称**、**图标**：覆盖消息发送者的名字和头像，图标填图片地址或 `:bell:` 这样的 emoji 代码。需要管理员在 System Console 打开 **Enable integrations to override usernames** 和 **Enable integrations to override profile picture icons**，没开时会被忽略
- **高级设置**：代理、超时、重试。自建 Mattermost 使用自签名证书时，打开 **跳过证书验证**

## 常见问题

- **web.incoming_webhook.invalid.app_error**：Webhook 地址不正确或已被删除
- **web.incoming_webhook.disabled.app_error**：Incoming Webhook 功能被管理员关闭
- **证书错误（x509）**：服务端使用了自签名证书，在媒介的高级设置里打开跳过证书验证
- **连接超时**：夜莺服务端访问不到 Mattermost，检查网络或在媒介的高级设置里填写代理
