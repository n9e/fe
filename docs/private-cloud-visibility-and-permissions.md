# 私有云品牌展示与功能权限隐藏

适用：fe、srm-fe、n9e-plus-fe 的新增页面、按钮、介绍文案、空白页、功能关联和自然语言查询入口。修改这些内容前先阅读本说明；三个仓库保留同名文档，规则变更时同步维护。

## 两层判断必须分开

1. 品牌 / 展示配置来自全局配置（设置页 `/config`），决定文档、首页介绍、空白页介绍如何展示。
2. 产品入口权限来自 `/api/n9e-plus/self/perms`，决定 FlashAI、灭火图入口及跨功能引用能否出现。

入口显示 = 对应功能有权限；介绍显示 = 对应功能有权限且当前展示模式为 `show`；产品文档链接还需通过文档开关。展示开关不能授予产品权限，权限开启也不能绕过品牌隐藏。Admin 豁免功能权限限制，但仍遵循品牌 / 介绍开关。前端隐藏不能代替后端鉴权，空间内的读写权限仍使用原有逻辑。

## 品牌 / 展示配置

- `privateCloudHideUsageDocs`：字符串 `true` 隐藏企业版使用说明、产品文档、外链文档及相应图标。缺省为展示；开源版维持原有展示。使用 `UsageDocs` 或 `useShowUsageDocs()`，不要散落判断或 CSS 隐藏。
- `privateCloudHomeMode`：`show` 展示首页介绍；`hide` 隐藏品牌宣传 / 能力介绍，保留有权限的产品入口。历史值 `simplify` 按 `hide` 兼容，未知值默认 `show`。
- `privateCloudEmptyMode`：`show` 展示完整引导；`simplify` 使用页面已有的精简空状态；`hide` 隐藏介绍区域。保留空状态必要的操作与数据反馈；不要把正常业务内容一并隐藏。FlashAI / 灭火图的介绍在 `simplify` 下也不展示。
- Logo、页面标题等继续使用已有品牌配置，不在新增页面硬编码品牌素材。不要因为隐藏宣传或文档而删除表单校验、必要操作说明或错误提示。

配置解析复用 `components/UsageDocs/guideVisibility.ts`、`visibility.ts`；整合态由 srm-fe 的 `src/App.n9e.tsx` 读取全局配置并写入 `CommonStateContext`。

## FlashAI 权限

- 接口原始权限 `/flashAI` 与路由别名 `/flashai` 等价。
- `profile.admin` 为真，或 `profile.roles` 包含 `Admin`，保留入口。
- 普通角色等待权限加载完成且包含对应权限才展示；不得用模型配置是否存在、用户名是否叫 root、导航是否可见来替代权限判断。
- srm-fe 独立运行的既有兼容分支允许“已加载但没有 perms 字段”；整合版本必须提供真实权限数组，不得借此放开权限。
- 业务入口复用 `useCanAccessFlashAiChat()`；需要点击时再次检查的操作复用 `useFlashAiLaunchGuard()`；介绍复用 `useCanShowFlashAiIntroduction('home' | 'empty')`。
- 纯函数见 srm-fe `src/components/AiChat/ConfigHost/access.ts`；FE 独立组件适配位于 `src/components/AiChat/hooks/useFlashAiAccess.ts`。plus 复用宿主公共 hook，不另建权限来源。

覆盖所有入口：侧栏、顶部按钮、悬浮球、抽屉、快捷动作、空白页、能力介绍、自然语言转 PromQL / SQL / 日志查询、AI 分析、规则与模板生成、仪表盘 AI、日志提取、知识库、巡检 / 自动化，以及工作流 `ai_summary`、`flashai_automation`。

## 灭火图权限与跨功能关联

- 复用 `components/FiremapAccess` 的 `canAccessFiremap()`、`useCanAccessFiremap()`、`useCanShowFiremapIntroduction()`。
- 普通角色要求精确的 `/firemap` 权限；`/firemap/screens` 等子路由权限不能推导出灭火图权限。Admin 的判定同上。
- 导航 / 首页产品入口，告警规则顶部引导，告警详情跳转和灭火图屏蔽入口，都应检查权限。
- 北极星的关联规则、图表下钻、蜂窝图关联配置；拓扑的灭火图节点工具、绑定与详情入口；内置组件的灭火图模板；截图推送的灭火图 / SLO 目标；知识库的灭火图类型；FlashAI 中的灭火图引用和建议；日志接入字段介绍，均属于跨功能检查范围。
- 普通拓扑及其他产品不因路径包含 firemap 就被一起隐藏。匿名分享沿用原有分享访问策略。
- “智能创建灭火图”等联合入口同时依赖 FlashAI、灭火图和 `ObsLoopEnabled` 站点开关，复用 `useCanUseObsLoop()`，不能只检查其中一个。
- 主机、APM、采集、数据源、Kubernetes、网络设备、拨测、Pingmesh、仪表盘的新入口与保存后引导都需核对联合依赖。

## 保留历史数据与避免隐式修改

- 隐藏产品入口，不删除已有告警、拓扑节点、知识条目、工作流步骤或截图规则。
- 无权限的历史链接可降为普通文本；已有受限类型可保留为禁用项，阻止编辑 / 新建 / 测试。
- 表单字段隐藏后，Ant Design 可能不再返回该字段。提交其他编辑时必须保留原关联值，不能把缺失字段当作用户主动清空。蜂窝图 `chart_config.hexbin.link2firemap` 是已覆盖的例子。
- 权限变化时关闭或卸载受限操作面板，阻止新请求和点击；取消 / 忽略旧异步结果，避免延迟响应重新显示受限入口。
- 只描述受限能力的提示应整体隐藏或改为当前可用能力的描述，不能只去掉按钮而留下无效引导。

## 新功能交付清单

- 判断是功能操作、品牌介绍、文档链接，还是多个产品联合能力；分别使用对应 gate。
- 同时检查所有入口：导航、页面头部、内容区、空白页、浮层、右键 / 更多菜单、保存后提示、直接访问页面。
- 介绍和操作分开，避免关介绍时把业务能力一起关掉。文案放模块 locales，不改根 `src/locales`。
- 验收普通角色的四种组合：均无、仅 FlashAI、仅灭火图、两项都有；再验收 Admin + 两项均无。
- 分别切换首页 `show/hide`、空白页 `show/simplify/hide`、文档展示 / 隐藏；Admin 同样验收展示开关。
- 验收已有配置不丢失、权限加载与切换、直接页面访问、无权限请求和多语言 / 明暗主题。
- 涉及组合能力时验收两项产品权限和站点开关；FlashAI 与灭火图清单保持独立，可同时设置验证组合。

## 验收组件与正式上线隔离

正式功能分支 `codex/feature-entry-permissions` 不包含角色模拟、localStorage 覆盖或验收浮窗。验收组件只存在于独立预览工作区和 `codex/feature-entry-permissions-acceptance` 分支。

- 验收分支仅部署到 Jenkins `srm-integration-menu-9`（9999）；不得合入 main / pre，也不得作为客户发布源。
- 验收层仅覆盖 React Context，不调用写权限 / 写配置接口。每位同事只改变自己浏览器的模拟状态；同源标签页同步。实际请求仍使用登录账号的真实权限。
- 验收层只在明确允许的验收 origin 生效；其他地址不读取模拟设置、不覆盖 Context、不渲染组件。角色模拟不能用于证明后端鉴权正确。
- 标准整合脚本在整合前检查三仓运行时源码是否含验收组件标识，发现则失败；也可单独运行 `node scripts/check-acceptance-isolation.js <仓库或整合目录>`。
- 正式交付应从三个正式功能分支重新整合、构建；不复用 9999 的 pub，不把验收分支整体合回功能分支。正常发布无需再手工删组件。
- 如确需从验收快照排除组件，移除 `src/components/PreviewPermissions`，将 `App.n9e.tsx` 的包装恢复为原 `CommonStateContext.Provider`，恢复正式整合检查，再重新构建。仅隐藏浮窗、设置默认真实角色或删除 localStorage 都不算移除。
- 发布前检查源码与产物，不应出现 `PreviewPermissions`、`permission-preview`、`feature-permission-acceptance-v2`、`flashai-permission-acceptance-v1`。验收开关不能成为正式 `/config` 设置。
