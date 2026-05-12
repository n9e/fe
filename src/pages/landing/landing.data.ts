export interface LandingCard {
  /** i18n key in `landing` namespace */
  titleKey: string;
  descriptionKey: string;
  /** 站内路由或外链；为空时点击不跳转 */
  url?: string;
  /** 用于触发特殊动作（如打开 AI 助手） */
  action?: 'openAiChat';
}

export interface LandingChip {
  titleKey?: string;
  /** chip 显示名（不参与翻译） */
  label?: string;
  iconUrl?: string;
  url?: string;
}

export interface LandingPill {
  titleKey: string;
  url?: string;
}

export interface LandingGuideLink {
  labelKey: string;
  url?: string;
}

export interface LandingGuideCard {
  titleKey: string;
  descriptionKey: string;
  links: LandingGuideLink[];
}

const DOCS_BASE = 'https://flashcat.cloud/product/nightingale/';
const DOCS_V8_BASE = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v8/';

export const DOC_LINKS = {
  base: DOCS_BASE,
  github: 'https://github.com/ccfos/nightingale',
  categraf: 'https://flashcat.cloud/product/categraf/',
};

export const landingHero = {
  badgeKey: 'hero.badge',
  title: 'Nightingale',
  highlightKey: 'hero.highlight',
  descriptionKey: 'hero.description',
  primaryAction: {
    labelKey: 'hero.primaryAction',
    url: DOCS_BASE,
  },
  secondaryAction: {
    labelKey: 'hero.secondaryAction',
    action: 'openAiChat' as const,
  },
  heroScreenshot: '/image/landing/hero-dashboard.png',
  heroScreenshotDark: '/image/landing/hero-dashboard-dark.png',
  lightGradientUrl: '/image/landing/hero/light-gradient.svg',
  darkGradientUrl: '/image/landing/hero/dark-gradient.svg',
  windowDotsUrl: '/image/landing/hero/window-dots.svg',
};

/** 场景 · 统一告警 — 4 张卡片 */
export const landingScenarioProducts: LandingCard[] = [
  { titleKey: 'matrix.scenario.businessGroups.title', descriptionKey: 'matrix.scenario.businessGroups.description', url: '/busi-groups' },
  { titleKey: 'matrix.scenario.alertGovernance.title', descriptionKey: 'matrix.scenario.alertGovernance.description', url: '/alert-rules' },
  { titleKey: 'matrix.scenario.eventHistory.title', descriptionKey: 'matrix.scenario.eventHistory.description', url: '/alert-his-events' },
  { titleKey: 'matrix.scenario.aiAssistant.title', descriptionKey: 'matrix.scenario.aiAssistant.description', action: 'openAiChat' },
];

/** 平台 · 统一观测 — pill 列表 */
export const landingObservabilityProducts: LandingPill[] = [
  { titleKey: 'matrix.observability.dashboard', url: '/dashboards' },
  { titleKey: 'matrix.observability.metricExplorer', url: '/metric/explorer' },
  { titleKey: 'matrix.observability.logExplorer', url: '/log/explorer' },
  { titleKey: 'matrix.observability.alertRules', url: '/alert-rules' },
  { titleKey: 'matrix.observability.alertMutes', url: '/alert-mutes' },
  { titleKey: 'matrix.observability.alertSubscribes', url: '/alert-subscribes' },
  { titleKey: 'matrix.observability.objectExplorer', url: '/targets' },
  { titleKey: 'matrix.observability.recordingRules', url: '/recording-rules' },
];

/** 右侧汇聚 — 通知矩阵 4 张卡片（替代 srm-fe 的"统一值班"，与场景卡片视觉一致：violet 圆形小图标 + 标题 + 副标题） */
export const landingNotificationCards: LandingCard[] = [
  { titleKey: 'matrix.notification.rules.title', descriptionKey: 'matrix.notification.rules.description', url: '/notification-rules' },
  { titleKey: 'matrix.notification.templates.title', descriptionKey: 'matrix.notification.templates.description', url: '/notification-templates' },
  { titleKey: 'matrix.notification.channels.title', descriptionKey: 'matrix.notification.channels.description', url: '/notification-channels' },
  { titleKey: 'matrix.notification.users.title', descriptionKey: 'matrix.notification.users.description', url: '/users' },
];

/** 数据 · 统一采集 — Categraf 卡片 */
export const landingCollectionProduct = {
  title: 'Categraf',
  descriptionKey: 'matrix.collection.description',
  footerKey: 'matrix.collection.footer',
  iconUrl: '/image/logo.svg',
  url: DOC_LINKS.categraf,
};

/** 数据 · 统一集成 — 数据源 chips */
export const landingIntegrationProducts: LandingChip[] = [
  { label: 'Prometheus', iconUrl: '/image/logos/prometheus.png', url: '/datasources' },
  { label: 'VictoriaMetrics', iconUrl: '/image/logos/victorialogs.png', url: '/datasources' },
  { label: 'Elasticsearch', iconUrl: '/image/logos/elasticsearch.png', url: '/datasources' },
  { label: 'ClickHouse', iconUrl: '/image/logos/ck.png', url: '/datasources' },
  { label: 'Loki', iconUrl: '/image/logos/loki.png', url: '/datasources' },
  { label: 'OpenSearch', iconUrl: '/image/logos/opensearch.png', url: '/datasources' },
  { label: 'TDengine', iconUrl: '/image/logos/tdengine.png', url: '/datasources' },
  { label: 'MySQL', iconUrl: '/image/logos/mysql.png', url: '/datasources' },
  { label: 'PostgreSQL', iconUrl: '/image/logos/pgsql.png', url: '/datasources' },
  { label: 'Doris', iconUrl: '/image/logos/doris.png', url: '/datasources' },
];

/** 基础设施分类 — 9 项 */
export const landingInfrastructureCategories: { titleKey: string }[] = [
  { titleKey: 'matrix.infrastructure.components' },
  { titleKey: 'matrix.infrastructure.microservice' },
  { titleKey: 'matrix.infrastructure.apiFunctions' },
  { titleKey: 'matrix.infrastructure.endpoints' },
  { titleKey: 'matrix.infrastructure.publicCloud' },
  { titleKey: 'matrix.infrastructure.privateCloud' },
  { titleKey: 'matrix.infrastructure.containers' },
  { titleKey: 'matrix.infrastructure.devices' },
  { titleKey: 'matrix.infrastructure.network' },
];

export const landingFootnotes = {
  scenario: ['matrix.footnotes.scenario.0', 'matrix.footnotes.scenario.1', 'matrix.footnotes.scenario.2'],
  observability: 'matrix.footnotes.observability',
  integration: 'matrix.footnotes.integration',
  notification: ['matrix.footnotes.notification.0', 'matrix.footnotes.notification.1'],
};

export const landingQuickStartCards: LandingGuideCard[] = [
  {
    titleKey: 'quickStart.ingest.title',
    descriptionKey: 'quickStart.ingest.description',
    links: [
      { labelKey: 'quickStart.ingest.links.0', url: `${DOCS_V8_BASE}install/compose/` },
      { labelKey: 'quickStart.ingest.links.1', url: `${DOCS_V8_BASE}agent/categraf/` },
    ],
  },
  {
    titleKey: 'quickStart.observe.title',
    descriptionKey: 'quickStart.observe.description',
    links: [
      { labelKey: 'quickStart.observe.links.0', url: `${DOCS_V8_BASE}quickstart/dashboard/` },
      { labelKey: 'quickStart.observe.links.1', url: `${DOCS_V8_BASE}quickstart/ad-hoc/` },
    ],
  },
  {
    titleKey: 'quickStart.alert.title',
    descriptionKey: 'quickStart.alert.description',
    links: [
      { labelKey: 'quickStart.alert.links.0', url: `${DOCS_V8_BASE}quickstart/metric-alerting/` },
      { labelKey: 'quickStart.alert.links.1', url: `${DOCS_V8_BASE}usecase/media/` },
    ],
  },
  {
    titleKey: 'quickStart.ai.title',
    descriptionKey: 'quickStart.ai.description',
    links: [
      { labelKey: 'quickStart.ai.links.0', url: `${DOCS_V8_BASE}usecase/processor/` },
      { labelKey: 'quickStart.ai.links.1', url: `${DOCS_V8_BASE}usecase/processor/` },
    ],
  },
];

export const landingAiAssistant = {
  titleKey: 'aiAssistant.title',
  descriptionKey: 'aiAssistant.description',
  capabilities: [
    { titleKey: 'aiAssistant.capabilities.0' },
    { titleKey: 'aiAssistant.capabilities.1' },
    { titleKey: 'aiAssistant.capabilities.2' },
    { titleKey: 'aiAssistant.capabilities.3' },
  ],
  actionLabelKey: 'aiAssistant.action',
};
