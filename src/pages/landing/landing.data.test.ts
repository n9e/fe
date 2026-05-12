import {
  landingScenarioProducts,
  landingObservabilityProducts,
  landingNotificationCards,
  landingIntegrationProducts,
  landingInfrastructureCategories,
  landingQuickStartCards,
  landingAiAssistant,
  landingHero,
  landingCollectionProduct,
  DOC_LINKS,
} from './landing.data';

describe('landing.data', () => {
  it('hero 配置具备必要字段', () => {
    expect(landingHero.title).toBe('Nightingale');
    expect(landingHero.heroScreenshot).toMatch(/^\/image\//);
    expect(landingHero.primaryAction.url).toBe(DOC_LINKS.base);
  });

  it('场景卡片为 4 张且 AI 卡通过 action 触发', () => {
    expect(landingScenarioProducts).toHaveLength(4);
    const aiCard = landingScenarioProducts.find((item) => item.action === 'openAiChat');
    expect(aiCard).toBeTruthy();
    landingScenarioProducts.forEach((item) => {
      expect(item.titleKey).toMatch(/^matrix\.scenario\./);
      expect(item.descriptionKey).toMatch(/^matrix\.scenario\./);
    });
  });

  it('平台·统一观测全部为站内路由', () => {
    expect(landingObservabilityProducts.length).toBeGreaterThanOrEqual(7);
    landingObservabilityProducts.forEach((item) => {
      expect(item.url?.startsWith('/')).toBe(true);
    });
  });

  it('通知矩阵 4 张卡片均有 i18n key 与站内路由', () => {
    expect(landingNotificationCards).toHaveLength(4);
    landingNotificationCards.forEach((item) => {
      expect(item.titleKey).toMatch(/^matrix\.notification\./);
      expect(item.descriptionKey).toMatch(/^matrix\.notification\./);
      expect(item.url?.startsWith('/')).toBe(true);
    });
  });

  it('数据源集成 chip 不为空且都有 logo', () => {
    expect(landingIntegrationProducts).toHaveLength(10);
    landingIntegrationProducts.forEach((item) => {
      expect(item.label).toBeTruthy();
      expect(item.iconUrl).toMatch(/^\/image\/logos\//);
    });
  });

  it('基础设施 9 个分类齐全', () => {
    expect(landingInfrastructureCategories).toHaveLength(9);
  });

  it('快速上手 4 张卡片，每卡 2 个文档链接，全部指向 flashcat.cloud', () => {
    expect(landingQuickStartCards).toHaveLength(4);
    landingQuickStartCards.forEach((card) => {
      expect(card.links).toHaveLength(2);
      card.links.forEach((link) => {
        expect(link.url).toMatch(/^https:\/\/flashcat\.cloud\/product\/nightingale\//);
      });
    });
  });

  it('AI 助手能力列表非空', () => {
    expect(landingAiAssistant.capabilities.length).toBeGreaterThanOrEqual(3);
  });

  it('采集卡片指向 Categraf 仓库', () => {
    expect(landingCollectionProduct.title).toBe('Categraf');
    expect(landingCollectionProduct.url).toBe(DOC_LINKS.categraf);
  });
});
