# Bark

[Bark](https://github.com/Finb/Bark) 是一个 iOS 推送 App：装好后会生成一个 Device Key，凭它就能把消息推到这台 iPhone 上。服务地址和认证在媒介里配置；Device Key 对应一台手机，跟手机号一样跟着人走，由每个人在个人信息里填写。

## 准备

- 在 iPhone 上安装 Bark App，打开后会看到形如 `https://api.day.app/<Device Key>/这里改成你自己的推送内容` 的地址，中间那一段就是 Device Key。
- 用公共服务 `https://api.day.app`：不需要注册，媒介全部留空即可。
- 自建服务：参考 [bark-server](https://github.com/Finb/bark-server) 部署，并在 Bark App 里添加自己的服务器；开启了 Basic 认证（`--user` / `--password`）时，在媒介里填写用户名和密码。

## 填写 Device Key

每个接收人在 **个人信息 → 联系方式** 里添加 **Bark Device Key**，只填 Device Key 本身，不要填整段地址。这个联系方式是内置的，管理员不需要先在联系方式设置里添加；管理员也可以在那里把它隐藏。

## 添加媒介

夜莺内置了一个 Bark 媒介，在 **告警通知 → 通知媒介** 的列表里直接编辑即可；也可以在左侧选择 **Bark** 再建一个（比如分别对应公共服务和自建服务）。

- **联系方式**：默认是 Bark Device Key，一般不用改。
- **服务地址**：自建服务的根地址，如 `https://bark.example.com`，不带 Device Key；留空使用 `https://api.day.app`。
- **用户名 / 密码**：自建服务开启 Basic 认证时同时填写。
- **提示音**：Bark 的铃声名称，如 `alarm`；留空使用接收人在 App 里选的铃声。
- **分组**：在通知中心里按分组归类推送。
- **高级设置**：代理、超时、重试；自建服务使用自签名证书时开启「跳过证书校验」。

## 测试

点 **测试**，选择接收人或团队后发送，然后在对应的 iPhone 上查看。团队里没填 Device Key 的人会在结果里列出来，其他人照常收到。

## 在通知规则中使用

选择 Bark 媒介后选择接收人或团队，消息模板选择 Bark 模板（正文键为 `content`，纯文本）。每个填了 Device Key 的接收人各收到一条推送，重复的 Key 只推一次。

## 收到的效果

推送级别固定，不需要配置：

| 夜莺 | Bark 级别 | 效果 |
| --- | --- | --- |
| S1 | timeSensitive | 时效性通知，可穿透专注模式 |
| S2、S3 | active | 普通通知 |
| 恢复 | passive | 静默送达，不响铃不亮屏 |

不使用 critical（静音和勿扰模式下也会响铃）。通知标题是「[S1] Triggered: 规则名」，正文是模板渲染的内容（超过 Apple 推送 4KB 上限时自动截断），点开通知跳转到事件详情。

## 排查

- `no Bark device key in the profile of: ...`：列出的用户没有在个人信息里填写 Bark Device Key。
- `invalid Bark device key`：填的是整段地址或带了空格，只保留 Device Key。
- `400 failed to get device token`：Device Key 不对，或没有在这个服务上注册（比如 App 用的是公共服务，媒介填的却是自建服务）。
- `418` / `401`：自建服务需要认证，检查用户名和密码。
- `500 push failed: BadDeviceToken` / `Unregistered`：Apple 已不再接受这个 Key，在 iPhone 上打开 Bark App 重新复制。
- `429`：触发 Bark 服务限流，已自动重试，稍后再试。
- 通知记录、报错和日志里的 Device Key 都打了掩码，只显示后 4 位（不足 12 位的 Key 完全隐藏）。

参考：[bark-server 推送接口](https://github.com/Finb/bark-server/blob/master/docs/API_V2.md)。
