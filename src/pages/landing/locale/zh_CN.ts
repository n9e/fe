const zh_CN = {
  pageTitle: '欢迎使用 Nightingale',
  hero: {
    badge: '开源 · 一站式监控告警平台',
    highlight: '让监控更简单、更智能',
    description: '指标 · 日志一体化采集与分析，告警治理、可视化大盘、智能助手开箱即用，云原生友好。',
    primaryAction: '查看文档',
    secondaryAction: '我要问 AI',
  },
  matrix: {
    headerKicker: '功能矩阵',
    headerSubtitle: '从数据采集、集成到统一观测与告警通知，构建一体化可观测平台',
    scenarioTag: '场景 · 统一告警',
    observabilityTag: '平台 · 统一观测',
    notificationTag: '触达 · 通知媒介',
    collectionTag: '数据 · 统一采集',
    integrationTag: '数据 · 统一集成',
    infrastructureTag: '企业服务基础设施',
    dataIngestArrow: '数据 · 统一接入',
    alertEventArrow: '告警事件',
    scenario: {
      businessGroups: {
        title: '业务组',
        description: '多租户与资源隔离',
      },
      alertGovernance: {
        title: '告警治理',
        description: '规则 · 屏蔽 · 订阅',
      },
      eventHistory: {
        title: '历史事件',
        description: '全量事件回溯分析',
      },
      aiAssistant: {
        title: 'AI 智能化',
        description: '大模型驱动的智能化能力',
      },
    },
    observability: {
      dashboard: '仪表盘',
      metricExplorer: '指标分析',
      logExplorer: '日志分析',
      alertRules: '告警规则',
      alertMutes: '告警屏蔽',
      alertSubscribes: '告警订阅',
      objectExplorer: '监控对象',
      recordingRules: '记录规则',
    },
    collection: {
      description: 'all-in-one 开源采集器',
      footer: '统一采集 metrics / logs',
    },
    infrastructure: {
      components: '基础组件',
      microservice: '微服务',
      apiFunctions: '接口/功能',
      endpoints: '端',
      publicCloud: '公有云',
      privateCloud: '私有云',
      containers: '容器/虚机',
      devices: '设备',
      network: '网络',
    },
    notification: {
      rules: { title: '通知规则', description: '精细化分派路由' },
      templates: { title: '通知模板', description: '统一消息样式' },
      channels: { title: '通知媒介', description: '多渠道触达' },
      users: { title: '用户与团队', description: '接收人组织管理' },
    },
    footnotes: {
      scenario: ['多租户业务组隔离', '告警规则 · 屏蔽 · 订阅', 'AI 大模型辅助分析'],
      observability: '一体化可观测平台能力',
      integration: '主流开源数据源',
      notification: ['通知中心', '通知与订阅'],
    },
  },
  quickStart: {
    title: '快速上手',
    viewAll: '查看全部文档',
    askAi: 'AI 来解答',
    ingest: {
      title: '统一接入',
      description: '快速完成部署与数据接入',
      links: ['如何使用 Docker Compose 快速部署 Nightingale？', '如何用 Categraf 采集主机和中间件数据？'],
    },
    observe: {
      title: '统一观测',
      description: '一体化指标、日志分析',
      links: ['如何使用仪表盘可视化业务指标？', '如何在指标分析中编写 PromQL 查询？'],
    },
    alert: {
      title: '告警治理',
      description: '告警规则配置与通知触达',
      links: ['如何配置我的第一条告警规则？', '如何接入企业 IM 实现告警通知？'],
    },
    ai: {
      title: 'AI 智能化',
      description: '大模型与智能体',
      links: ['如何配置 LLM 模型？', '如何使用 Agent 自动分析告警？'],
    },
  },
  aiAssistant: {
    title: 'Nightingale AI 智能助手',
    description: '基于大语言模型，自然语言完成平台操作、查询数据、分析告警根因。',
    capabilities: ['自然语言查询', '告警根因分析', 'PromQL / LogQL 生成', '文档智能问答'],
    action: '立即体验 AI 助手',
  },
};

export default zh_CN;
