# Flashduty 配置指南

Flashduty 定位為企業一站式告警響應平台，可以通過 webhook 方式接收和處理告警事件。本文將介紹如何配置 Flashduty 來接收告警通知。

## 前置條件

- 已註冊 Flashduty 賬號並創建協作空間
- 確保夜鶯系統可以訪問 api.flashcat.cloud 域名

## 配置步驟

### 1. 獲取集成推送地址

您可以通過以下方式來獲取集成推送地址：
1. 進入"集成中心 => [集成列表](https://console.flashcat.cloud/settings/source/alert)"，
2. 選擇"告警事件"標籤頁，
3. 點擊添加 "夜鶯" 集成，並配置
4. 保存後獲取推送地址，地址樣式為 https://api.flashcat.cloud/event/push/alert/n9e?integration_key=xxx

### 2. 配置推送地址
將獲取到的推送地址配置到 Flashduty URL 中。
- URL：填寫獲取到的推送地址
- Proxy：填寫代理地址，當您需要通過代理訪問 Flashduty 時，填寫代理地址

## 常見問題排查

如果沒有收到告警通知，請按以下步驟排查：

1. 驗證推送地址是否正確配置
2. 檢查網絡連通性，確保可以訪問 api.flashcat.cloud

如果問題仍然存在，請聯繫[技術支持](https://flashcat.cloud/contact/)獲取幫助。
