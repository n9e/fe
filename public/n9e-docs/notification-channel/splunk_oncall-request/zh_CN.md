# Splunk On-Call

通过 REST 集成把告警发到 Splunk On-Call（原 VictorOps），触发值班升级；告警恢复时自动解决对应的事件。REST 集成的 API Key 在媒介里配置，Routing Key 在通知规则里填写。

## 准备

1. 需要一个 Splunk On-Call 账号；可以在 [Splunk 免费试用](https://www.splunk.com/en_us/download/on-call.html) 申请 14 天试用。
2. 打开 **Integrations → 3rd Party Integrations → REST - Generic**，未启用时点 **Enable Integration**。页面上的 **URL to notify** 形如 `https://alert.victorops.com/integrations/generic/20131114/alert/<API Key>/$routing_key`，`/alert/` 后面那一段就是 **API Key**（点眼睛图标显示，复制图标复制整段地址）。

<img width='100%' src='/n9e-docs/notification-channel/splunk_oncall-request/vendor-rest.png' />

3. 在 **Settings → Routing Keys** 里点 **Add Key**，填一个 Key（如 `n9e`）并选择它对应的升级策略（哪个团队值班）。没有匹配到任何 Routing Key 的告警会走 **Default Routing Policy**。路由变更最多需要 10 分钟生效。

<img width='100%' src='/n9e-docs/notification-channel/splunk_oncall-request/vendor-routing-key.png' />

## 添加媒介

在 **告警通知 → 通知媒介** 左侧选择 **Splunk On-Call**。

<img width='60%' src='/n9e-docs/notification-channel/splunk_oncall-request/types.zh_CN.png' />

<img width='100%' src='/n9e-docs/notification-channel/splunk_oncall-request/form.zh_CN.png' />

- **API Key**：REST 集成的 Key；支持 `{{.变量名}}` 引用变量配置。
- **高级设置**：接口地址、代理、超时和重试。把集成页面给的完整地址贴到接口地址里也可以。

## 测试

点 **测试**，填一个 Routing Key 后发送。「同时测试恢复（解决事件）」默认勾选，会先触发、再解决同一个测试事件，结果里能看到两次发送：

<img width='100%' src='/n9e-docs/notification-channel/splunk_oncall-request/test.zh_CN.png' />

<img width='100%' src='/n9e-docs/notification-channel/splunk_oncall-request/test-result.zh_CN.png' />

## 在通知规则中使用

<img width='100%' src='/n9e-docs/notification-channel/splunk_oncall-request/rule.zh_CN.png' />

- **Routing Key**：只填 Key 本身；支持 `{{.变量名}}`。
- **名称**：用于通知记录展示和历史参数复用；不填时记录里显示 Routing Key。
- **消息模板**：选择 Splunk On-Call 模板，`title` 是事件的显示名称，`content` 是详细描述。

## 收到的效果

消息类型固定为 S1→CRITICAL、S2/S3→WARNING。CRITICAL 会创建事件，WARNING 是否创建事件取决于 Splunk On-Call 集成设置。无需在夜莺配置等级映射。

每条告警以事件哈希作为 `entity_id`：触发、重复通知都落在同一个事件上，恢复时用同一个 `entity_id` 发送 `RECOVERY`，事件随之自动解决（Resolved by SYSTEM）。事件里带有 **Event details** 链接注解，可以跳回夜莺的事件详情。下图是一条告警从触发到自动解决的时间线：

<img width='50%' src='/n9e-docs/notification-channel/splunk_oncall-request/vendor-incident.png' />

## 排查

- HTTP 404：API Key 不对，或 REST 集成的 Key 已被撤销（Revoke API Key）。
- 其他 4xx：检查规则里的 Routing Key，以及 REST 集成是否已启用。
- 返回 `result: failure`：按报错里的 message 处理。
- 告警没有落到预期的团队：检查 Routing Key 绑定的升级策略；新建或修改的 Routing Key 最多 10 分钟生效。

参考：[REST Endpoint 集成](https://help.splunk.com/en/splunk-observability-cloud/splunk-on-call/integrations-with-splunk-on-call/rest-endpoint-integration-for-splunk-on-call)。
