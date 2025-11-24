# PagerDuty 配置指南

由 AI 驅動的次世代事件管理

## 前置條件

- 已註冊 PagerDuty 帳號並取得 API Key
- 確保夜鶯系統可以存取 api.pagerduty.com 網域

## 配置步驟

1. 取得使用者或帳戶的 API Key
登入 PagerDuty 控制台
點擊右上角頭像，選擇 My Profile > User Settings > API Access
建議建立角色為「管理員」或「排班管理員」的使用者，並使用該使用者的 API Key 進行整合。若無特殊需求，可建立僅具唯讀權限的 API Key，但請確保該 Key 有權限存取所需的資源。

參考：

https://support.pagerduty.com/main/docs/api-access-keys#section-generating-a-general-access-rest-api-key