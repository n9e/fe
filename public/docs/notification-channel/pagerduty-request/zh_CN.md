# Pagerduty 配置指南

Next-level Incident Management powered by AI

## 前置条件

- 已注册 PagerDuty 账号并获取API Key
- 确保夜莺系统可以访问 api.pagerduty.com 域名

## 配置步骤

### 1. 获取用户或账户的 API Key

1. 登录 PagerDuty 控制台

2. 点击右上角的头像，选择 My Profile > User Settings > API Access

推荐创建用户角色为“管理员”或“调度管理员”的用户，并使用该用户的 API Key 进行集成。

如果没有写需求，可以创建一个只读权限的API Key，但请确保该Key有权限访问所需的资源。

- https://support.pagerduty.com/main/docs/api-access-keys#section-generating-a-general-access-rest-api-key