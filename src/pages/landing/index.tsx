import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import {
  Activity,
  BarChart3,
  Bell,
  BookOpenText,
  Boxes,
  Bot,
  Cloud,
  Container,
  Cpu,
  Database,
  FileText,
  Flame,
  HardDrive,
  History,
  Layers,
  MessageSquare,
  Network,
  PawPrint,
  PlugZap,
  Server,
  Smartphone,
  Sparkles,
  Star,
  Users as UsersIcon,
  UsersRound,
  Waypoints,
  LayoutPanelLeft,
  Monitor,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import PageLayout from '@/components/pageLayout';
import { useAiChatContext } from '@/components/AiChatNG';
import { buildPageFrom } from '@/components/AiChatNG/recommend';
import {
  DOC_LINKS,
  landingAiAssistant,
  landingCollectionProduct,
  landingFootnotes,
  landingHero,
  landingInfrastructureCategories,
  landingIntegrationProducts,
  landingNotificationCards,
  landingObservabilityProducts,
  landingQuickStartCards,
  landingScenarioProducts,
} from './landing.data';
import './style.less';

const scenarioIcons: LucideIcon[] = [UsersIcon, Flame, History, Sparkles];
const notificationIcons: LucideIcon[] = [Bell, FileText, MessageSquare, UsersRound];
const infrastructureIcons: LucideIcon[] = [Layers, Server, PlugZap, Smartphone, Cloud, HardDrive, Container, Cpu, Network];
const quickStartIcons: LucideIcon[] = [PlugZap, BarChart3, Bell, Sparkles];
const quickStartIconClasses = [
  'bg-violet-500/15 text-violet-500',
  'bg-blue-500/15 text-blue-500',
  'bg-amber-500/15 text-amber-500',
  'bg-emerald-500/15 text-emerald-500',
];
const aiCapabilityIcons: LucideIcon[] = [Sparkles, Activity, Boxes, BookOpenText];

function isInternalUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('/') && !url.startsWith('//');
}

interface LinkProps {
  href?: string;
  target?: '_blank';
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

function makeLinkProps(url: string | undefined, history: ReturnType<typeof useHistory>, onAction?: () => void): LinkProps {
  if (onAction) {
    return {
      href: '#',
      onClick: (e) => {
        e.preventDefault();
        onAction();
      },
    };
  }
  if (!url) {
    return {
      href: '#',
      onClick: (e) => {
        e.preventDefault();
      },
    };
  }
  if (isInternalUrl(url)) {
    return {
      href: url,
      onClick: (e) => {
        e.preventDefault();
        history.push(url);
      },
    };
  }
  return {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
  };
}

export default function Landing() {
  const { t } = useTranslation('landing');
  const history = useHistory();
  const { openAiChat } = useAiChatContext();

  const handleAskAi = useCallback(
    (prefill?: string) => {
      openAiChat({
        queryPageFrom: buildPageFrom({ url: '/landing' }),
        promptList: prefill
          ? [prefill]
          : [
              t('quickStart.ingest.links.0'),
              t('quickStart.observe.links.0'),
              t('quickStart.alert.links.0'),
              t('quickStart.ai.links.0'),
            ],
      });
    },
    [openAiChat, t],
  );

  return (
    <PageLayout title={t('pageTitle')}>
      <div className='landing-page best-looking-scroll'>
        <div className='landing-surface'>
          {/* Section 1 · Hero */}
          <section className='landing-hero'>
            <div className='landing-hero-bg' aria-hidden>
              <div className='landing-hero-bg-base' />
              <img className='landing-hero-bg-gradient landing-hero-bg-gradient-light' src={landingHero.lightGradientUrl} alt='' />
              <img className='landing-hero-bg-gradient landing-hero-bg-gradient-dark' src={landingHero.darkGradientUrl} alt='' />
              <div className='landing-hero-bg-tint' />
            </div>
            <div className='landing-hero-copy'>
              <div className='landing-badge'>
                <span className='landing-badge-dot' />
                <span>{t('hero.badge')}</span>
              </div>
              <div className='landing-hero-title'>
                <div className='landing-hero-title-main'>{landingHero.title}</div>
                <div className='landing-hero-title-highlight'>{t('hero.highlight')}</div>
              </div>
              <div className='landing-hero-description'>{t('hero.description')}</div>
              <div className='landing-hero-actions'>
                <a className='landing-hero-btn landing-hero-btn-primary' href={landingHero.primaryAction.url} target='_blank' rel='noopener noreferrer'>
                  <BookOpenText className='landing-hero-btn-icon' strokeWidth={1.9} />
                  <span>{t('hero.primaryAction')}</span>
                </a>
                <button className='landing-hero-btn landing-hero-btn-secondary' type='button' onClick={() => handleAskAi()}>
                  <Sparkles className='landing-hero-btn-icon landing-ai-breath-icon' strokeWidth={1.9} />
                  <span>{t('hero.secondaryAction')}</span>
                </button>
                <a className='landing-hero-btn landing-hero-btn-ghost' href={DOC_LINKS.github} target='_blank' rel='noopener noreferrer'>
                  <Star className='landing-hero-btn-icon' strokeWidth={1.9} />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
            <div className='landing-hero-visual'>
              <div className='landing-hero-window'>
                <div className='landing-hero-window-bar'>
                  <span className='landing-hero-window-dot' />
                  <span className='landing-hero-window-dot' />
                  <span className='landing-hero-window-dot' />
                </div>
                <img className='landing-hero-screenshot landing-hero-screenshot-light' src={landingHero.heroScreenshot} alt='' />
                <img className='landing-hero-screenshot landing-hero-screenshot-dark' src={landingHero.heroScreenshotDark} alt='' />
              </div>
            </div>
          </section>

          {/* Section header for the matrix */}
          <div className='landing-header'>
            <div className='landing-kicker'>{t('matrix.headerKicker')}</div>
            <div className='landing-subtitle'>{t('matrix.headerSubtitle')}</div>
          </div>

          {/* Section 2 · 产品矩阵 — nested tinted shell containers wrap white sub-panels */}
          <div className='landing-matrix'>
            {/* Left tinted shell — violet wash holds scenario + observability panels */}
            <div className='landing-matrix-main-shell'>
              <section className='landing-panel landing-panel-violet landing-panel-scenario'>
                <div className='landing-panel-tag'>
                  <TriangleAlert className='landing-panel-tag-icon' strokeWidth={1.9} />
                  <span>{t('matrix.scenarioTag')}</span>
                </div>
                <div className='landing-card-grid'>
                  {landingScenarioProducts.map((item, index) => {
                    const Icon = scenarioIcons[index] || Sparkles;
                    const onAction = item.action === 'openAiChat' ? () => handleAskAi() : undefined;
                    const linkProps = makeLinkProps(item.url, history, onAction);
                    return (
                      <a {...linkProps} className='landing-feature-card' key={item.titleKey}>
                        <span className='landing-feature-icon'>
                          <Icon strokeWidth={1.8} />
                        </span>
                        <div className='landing-feature-title'>{t(item.titleKey)}</div>
                        <div className='landing-feature-description'>{t(item.descriptionKey)}</div>
                      </a>
                    );
                  })}
                </div>
                <div className='landing-inline-notes'>
                  {landingFootnotes.scenario.map((key, index) => (
                    <React.Fragment key={key}>
                      {index > 0 && <span className='landing-note-divider'>|</span>}
                      <span>{t(key)}</span>
                    </React.Fragment>
                  ))}
                </div>
              </section>

              <section className='landing-panel landing-panel-violet landing-panel-observability'>
                <div className='landing-panel-tag'>
                  <Monitor className='landing-panel-tag-icon' strokeWidth={1.9} />
                  <span>{t('matrix.observabilityTag')}</span>
                </div>
                <div className='landing-pill-grid'>
                  {landingObservabilityProducts.map((item) => {
                    const linkProps = makeLinkProps(item.url, history);
                    return (
                      <a {...linkProps} className='landing-pill' key={item.titleKey}>
                        {t(item.titleKey)}
                      </a>
                    );
                  })}
                </div>
                <div className='landing-caption'>{t(landingFootnotes.observability)}</div>
              </section>
            </div>

            {/* Right tinted shell — pink wash, holds 4 notification cards stacked */}
            <div className='landing-matrix-duty-shell'>
              <section className='landing-panel landing-panel-pink landing-panel-duty'>
                <div className='landing-panel-tag'>
                  <Bell className='landing-panel-tag-icon' strokeWidth={1.9} />
                  <span>{t('matrix.notificationTag')}</span>
                </div>
                <div className='landing-stack landing-stack-duty'>
                  {landingNotificationCards.map((item, index) => {
                    const Icon = notificationIcons[index] || Bell;
                    const linkProps = makeLinkProps(item.url, history);
                    return (
                      <a {...linkProps} className='landing-duty-card' key={item.titleKey}>
                        <span className='landing-duty-icon-slot'>
                          <Icon className='landing-duty-icon' strokeWidth={1.9} />
                        </span>
                        <div className='landing-duty-text'>
                          <div className='landing-duty-title'>{t(item.titleKey)}</div>
                          <div className='landing-duty-description'>{t(item.descriptionKey)}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
                <div className='landing-inline-notes compact'>
                  {landingFootnotes.notification.map((key, index) => (
                    <React.Fragment key={key}>
                      {index > 0 && <span className='landing-note-divider'>|</span>}
                      <span>{t(key)}</span>
                    </React.Fragment>
                  ))}
                </div>
              </section>
            </div>

            {/* Vertical arrow indicators between shells */}
            <div className='landing-matrix-arrow landing-matrix-arrow-ingest'>
              <span className='landing-matrix-arrow-bg' aria-hidden />
              <div className='landing-matrix-arrow-label'>
                <span className='landing-matrix-arrow-up' aria-hidden />
                <span>{t('matrix.dataIngestArrow')}</span>
              </div>
            </div>
            <div className='landing-matrix-arrow landing-matrix-arrow-alert'>
              <span className='landing-matrix-arrow-bg' aria-hidden />
              <div className='landing-matrix-arrow-label'>
                <span className='landing-matrix-arrow-up' aria-hidden />
                <span>{t('matrix.alertEventArrow')}</span>
              </div>
            </div>

            {/* Bottom tinted shell — blue wash, holds collection + integration + infrastructure */}
            <div className='landing-matrix-data-shell'>
              <div className='landing-data-grid'>
                <section className='landing-panel landing-panel-blue landing-panel-collection'>
                  <div className='landing-panel-tag'>
                    <Database className='landing-panel-tag-icon' strokeWidth={1.9} />
                    <span>{t('matrix.collectionTag')}</span>
                  </div>
                  <a href={landingCollectionProduct.url} target='_blank' rel='noopener noreferrer' className='landing-collector-card'>
                    <div className='landing-collector-badge'>
                      <PawPrint strokeWidth={1.8} />
                    </div>
                    <div className='landing-collector-text'>
                      <div className='landing-collector-title'>{landingCollectionProduct.title}</div>
                      <div className='landing-collector-description'>{t(landingCollectionProduct.descriptionKey)}</div>
                    </div>
                  </a>
                  <div className='landing-caption'>{t(landingCollectionProduct.footerKey)}</div>
                </section>

                <section className='landing-panel landing-panel-blue landing-panel-integration'>
                  <div className='landing-panel-tag'>
                    <Waypoints className='landing-panel-tag-icon' strokeWidth={1.9} />
                    <span>{t('matrix.integrationTag')}</span>
                  </div>
                  <div className='landing-chip-grid'>
                    {landingIntegrationProducts.map((item) => {
                      const linkProps = makeLinkProps(item.url, history);
                      return (
                        <a {...linkProps} className='landing-integration-chip' key={item.label}>
                          <span className='landing-integration-chip-logo-wrap'>
                            {item.iconUrl ? <img src={item.iconUrl} alt='' /> : null}
                          </span>
                          <span className='landing-integration-chip-label'>{item.label}</span>
                        </a>
                      );
                    })}
                  </div>
                  <div className='landing-caption'>{t(landingFootnotes.integration)}</div>
                </section>
              </div>

              <section className='landing-panel landing-panel-blue landing-panel-infrastructure'>
                <div className='landing-panel-tag'>
                  <LayoutPanelLeft className='landing-panel-tag-icon' strokeWidth={1.9} />
                  <span>{t('matrix.infrastructureTag')}</span>
                </div>
                <div className='landing-infrastructure-grid'>
                  {landingInfrastructureCategories.map((item, index) => {
                    const Icon = infrastructureIcons[index] || Server;
                    return (
                      <article className='landing-infrastructure-item' key={item.titleKey}>
                        <span className='landing-icon landing-icon-blue'>
                          <Icon strokeWidth={1.8} />
                        </span>
                        <div>{t(item.titleKey)}</div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>

          {/* Section 3 · 快速上手 */}
          <section className='landing-guide'>
            <div className='landing-guide-header'>
              <div className='landing-guide-header-left'>
                <h3 className='landing-guide-title'>{t('quickStart.title')}</h3>
                <a className='landing-guide-all-docs' href={DOC_LINKS.base} target='_blank' rel='noopener noreferrer'>
                  <BookOpenText className='landing-guide-all-docs-icon' strokeWidth={1.9} />
                  {t('quickStart.viewAll')}
                </a>
              </div>
            </div>
            <div className='landing-guide-grid'>
              {landingQuickStartCards.map((item, index) => {
                const Icon = quickStartIcons[index] || Sparkles;
                return (
                  <div key={item.titleKey} className='landing-quickstart-card'>
                    <div className='landing-quickstart-card-head'>
                      <div className={classNames('landing-quickstart-icon', quickStartIconClasses[index])}>
                        <Icon strokeWidth={1.9} />
                      </div>
                      <div className='landing-quickstart-text'>
                        <h4 className='landing-quickstart-title'>{t(item.titleKey)}</h4>
                        <p className='landing-quickstart-description'>{t(item.descriptionKey)}</p>
                      </div>
                    </div>
                    <div className='landing-quickstart-link-list'>
                      {item.links.map((link) => {
                        const linkLabel = t(link.labelKey);
                        return (
                          <div key={link.labelKey} className='landing-quickstart-link-row'>
                            <a className='landing-quickstart-link' href={link.url} target='_blank' rel='noopener noreferrer'>
                              <ArrowRightOutlined className='landing-quickstart-link-arrow' />
                              <span className='landing-quickstart-link-label'>{linkLabel}</span>
                            </a>
                            <button
                              type='button'
                              className='landing-quickstart-ask-ai-btn'
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAskAi(linkLabel);
                              }}
                            >
                              <Sparkles className='landing-quickstart-ask-ai-icon' strokeWidth={1.9} />
                              <span>{t('quickStart.askAi')}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 4 · AI 助手 callout */}
          <section className='landing-section'>
            <div className='landing-ai-callout'>
              <div className='landing-ai-callout-inner'>
                <div className='landing-ai-callout-icon'>
                  <Bot strokeWidth={1.8} />
                </div>
                <div className='landing-ai-callout-body'>
                  <h3 className='landing-ai-callout-title'>{t('aiAssistant.title')}</h3>
                  <p className='landing-ai-callout-description'>{t('aiAssistant.description')}</p>
                  <div className='landing-ai-capability-list'>
                    {landingAiAssistant.capabilities.map((cap, index) => {
                      const Icon = aiCapabilityIcons[index] || Sparkles;
                      return (
                        <span key={cap.titleKey} className='landing-ai-capability-tag'>
                          <Icon className='landing-ai-capability-icon' strokeWidth={1.9} />
                          {t(cap.titleKey)}
                        </span>
                      );
                    })}
                  </div>
                  <button type='button' className='landing-ai-callout-btn' onClick={() => handleAskAi()}>
                    <Sparkles className='landing-ai-callout-btn-icon landing-ai-breath-icon' strokeWidth={1.9} />
                    {t('aiAssistant.action')}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
