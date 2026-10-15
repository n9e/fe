# ntfy

[ntfy](https://ntfy.sh) 是一个开源的推送服务，可以用公共服务 ntfy.sh，也可以自建。服务地址和认证在媒介里配置，Topic 在通知规则里填写。

## 准备

- 用公共服务 ntfy.sh：不需要注册，想好一个 Topic 名称即可。**公共服务上，知道 Topic 的人都能读到消息**，请使用不易猜到的名称（如 `ops-alerts-7f3k9q`）。
- 自建服务：参考 [ntfy 安装文档](https://docs.ntfy.sh/install/)，需要认证时在服务端创建用户或 Access Token（以 `tk_` 开头）。
- 接收人在 ntfy 的 [Android / iOS App](https://docs.ntfy.sh/subscribe/phone/) 或网页（如 `https://ntfy.sh/<Topic>`）里订阅同一个 Topic。

## 添加媒介

夜莺内置了一个 ntfy 媒介，在 **告警通知 → 通知媒介** 的列表里直接编辑即可；也可以在左侧选择 **ntfy** 再建一个（比如分别对应公共服务和自建服务）。

<img width='60%' src='/n9e-docs/notification-channel/ntfy-request/types.zh_CN.png' />

<img width='100%' src='/n9e-docs/notification-channel/ntfy-request/form.zh_CN.png' />

内置媒介全部留空即可使用：发到 `https://ntfy.sh`，不带认证。

- **服务地址**：自建服务的根地址，如 `https://ntfy.example.com`，不带 Topic。
- **Access Token**：在 ntfy 的账号设置里创建，以 `tk_` 开头。
- **用户名 / 密码**：与 Access Token 二选一。
- **高级设置**：代理、超时、重试；自建服务使用自签名证书时开启「跳过证书校验」。

## 测试

点 **测试**，填一个 Topic 后发送，然后在订阅了这个 Topic 的 App 或网页里查看。

<img width='100%' src='/n9e-docs/notification-channel/ntfy-request/test.zh_CN.png' />

<img width='100%' src='/n9e-docs/notification-channel/ntfy-request/test-result.zh_CN.png' />

## 在通知规则中使用

<img width='100%' src='/n9e-docs/notification-channel/ntfy-request/rule.zh_CN.png' />

- **Topic**：只填 Topic 名称（1 到 64 位字母、数字、下划线或连字符），不要填完整地址；支持 `{{.变量名}}`。
- **名称**：用于通知记录展示和历史参数复用；不填时记录里只显示 Topic 的后 4 位。
- **消息模板**：选择 ntfy 模板，正文键为 `content`，纯文本。

## 收到的效果

优先级固定为 S1→Max（5）、S2→High（4）、S3→Default（3），恢复通知固定使用 Default（3）。无需配置等级映射；声音、振动和免打扰行为由接收人的客户端设置决定。

通知标题是「[S1] Triggered: 规则名」，带级别图标；点击通知或 **Event details** 按钮跳转到事件详情，告警中还有 **Silence 1h** 按钮。正文超过 4096 字节会截断（ntfy 会把更长的消息转成附件）。下图是 ntfy 网页里收到的一条告警和它的恢复通知：

<img width='80%' src='/n9e-docs/notification-channel/ntfy-request/vendor-delivered.png' />

## 排查

- `40101 unauthorized`：服务需要认证，检查 Access Token 或用户名密码。
- `40301 forbidden`：这个用户没有向该 Topic 发布的权限，或 Topic 已被别人保留。
- `42901` / `42908`：触发限流，或当日消息额度已用完。
- 自建服务报证书错误：在高级设置里开启「跳过证书校验」。

参考：[ntfy 发布接口](https://docs.ntfy.sh/publish/)。
