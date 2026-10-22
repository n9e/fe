# Microsoft Teams

在 Teams 的 Workflows 中创建以 **When a Teams webhook request is received** 为触发器的工作流，选择 **Anyone** 调用权限，并配置发送卡片的频道或聊天。保存并复制完整 Webhook URL（包括查询参数）。本媒介使用 Adaptive Card，不需要填写 JSON 请求体。

## 媒介配置

代理、超时和重试为所有通知规则共享。Webhook URL 在通知规则中填写，每条规则可以使用不同工作流。请为工作流设置合适的所有者或共同所有者，确保持续可用。

## 通知规则

- **Webhook URL**：粘贴完整地址；支持 `{{.变量名}}` 引用夜莺变量配置。
- **名称**：用于历史参数复用及通知记录展示。
- **消息模板**：选择 Microsoft Teams 模板，正文键为 `content`。默认正文只放告警描述和额外标签，可继续自定义 Markdown。

卡片自动展示彩色状态栏、告警标题、监控对象和触发值；恢复时展示持续时间。时间按 Teams 查看者的时区显示。详情、屏蔽和曲线采用底部按钮，不再与正文重复；恢复时隐藏屏蔽按钮，仅 Prometheus 事件显示曲线按钮。没有配置有效站点地址时不显示链接按钮。

## 测试与排查

保存前可以在测试窗口填写 Webhook URL，并选择触发或恢复事件。测试会向对应工作流提交通知。成功表示 Webhook 已受理；如果 Teams 没有出现卡片，请查看 Power Automate 工作流运行历史、发卡片步骤和频道权限。

正文超过 4000 个字符会截断，完整卡片不得超过 28 KB。HTTP 429 和服务端临时错误会按配置重试。认证仅支持带签名 URL 的 Anyone 工作流，不支持需要 Microsoft Entra 登录令牌的工作流。

参考：[微软 Workflows Webhook](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)、[Adaptive Card 格式](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using)。

## 首次配置的快捷路径

在目标频道的“更多选项”中打开 **Workflows**，选择 **Send webhook alerts to a channel**，确认团队和频道，命名工作流并保存，然后使用 **Copy webhook link** 获取地址。首次使用时，按提示登录 Teams 连接。

如果 Sign in / Save 一直不可用，并出现 `UserConsentMissing`，先打开 [Power Automate](https://make.powerautomate.com)，完成账号首次使用的 **Get started**，再回到 Teams 重新打开模板。
