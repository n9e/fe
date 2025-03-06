# Flashduty 配置指南

Flashduty 定位为企业一站式告警响应平台，可以通过 webhook 方式接收和处理告警事件。本文将介绍如何配置 Flashduty 来接收告警通知。

## 前置条件

- 已注册 Flashduty 账号并创建协作空间
- 确保夜莺系统可以访问 api.flashcat.cloud 域名

## 配置步骤

### 1. 获取集成推送地址

您可以通过以下方式来获取集成推送地址：
1. 进入"集成中心 => [集成列表](https://console.flashcat.cloud/settings/source/alert)"，
2. 选择"告警事件"标签页，
3. 点击添加 "夜莺" 集成，并配置
4. 保存后获取推送地址，地址样式为 https://api.flashcat.cloud/event/push/alert/n9e?integration_key=xxx

### 2. 配置推送地址
将获取到的推送地址配置到 Flashduty URL 中。
- URL：填写获取到的推送地址
- Proxy: 填写代理地址，当您需要通过代理访问 Flashduty 时，填写代理地址

## 常见问题排查

如果没有收到告警通知，请按以下步骤排查：

1. 验证推送地址是否正确配置
2. 检查网络连通性，确保可以访问 api.flashcat.cloud

如果问题仍然存在，请联系[技术支持](https://flashcat.cloud/contact/)获取帮助。
