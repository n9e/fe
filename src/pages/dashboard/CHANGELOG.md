> 12/20/2024 创建 CHANGELOG.md 文件用于记录无法兼容的更新说明

## 3.1.0

- 新增版本迁移方法 `src/pages/dashboard/Detail/utils/dashboardMigrator.ts`

### BarGauge

- feat: 新增 "显示模式" 设置项，原默认为基础模式同时新增 Retro LCD 模式
- refactor: 去除 "最大值" 设置项，由 "高级设置" 中的 "最大值" 设置项代替
- refactor: 去除 "基础颜色" 设置项，新增 "阈值" 设置项，基础颜色由 "阈值" 设置项的基础颜色代替
