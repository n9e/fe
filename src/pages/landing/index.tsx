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
import { buildPageFrom, getRecommendByUrl } from '@/components/AiChatNG/recommend';
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
const quickStartIconClasses = ['bg-violet-500/15 text-violet-500', 'bg-blue-500/15 text-blue-500', 'bg-amber-500/15 text-amber-500', 'bg-emerald-500/15 text-emerald-500'];
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
  const { t, i18n } = useTranslation('n9e-landing');
  const history = useHistory();
  const { openAiChat } = useAiChatContext();

  const handleAskAi = useCallback(
    (prefill?: string) => {
      const recommend = getRecommendByUrl('/landing', i18n.language);
      openAiChat({
        queryPageFrom: buildPageFrom({ url: '/landing' }),
        promptList: prefill ? [prefill] : recommend?.promptList,
      });
    },
    [openAiChat, i18n.language],
  );

  return (
    <PageLayout title={t('pageTitle')}>
      <div className='n9e-landing-page best-looking-scroll'>
        <div className='n9e-landing-surface'>
          {/* Section 1 · Hero */}
          <section className='n9e-landing-hero'>
            <div className='n9e-landing-hero-bg' aria-hidden>
              <div className='n9e-landing-hero-bg-base' />
              <img className='n9e-landing-hero-bg-gradient n9e-landing-hero-bg-gradient-light' src={landingHero.lightGradientUrl} alt='' />
              <img className='n9e-landing-hero-bg-gradient n9e-landing-hero-bg-gradient-dark' src={landingHero.darkGradientUrl} alt='' />
              <div className='n9e-landing-hero-bg-tint' />
            </div>
            <div className='n9e-landing-hero-copy'>
              <div className='n9e-landing-badge'>
                <span className='n9e-landing-badge-dot' />
                <span>{t('hero.badge')}</span>
              </div>
              <div className='n9e-landing-hero-title'>
                <div className='n9e-landing-hero-title-main'>{landingHero.title}</div>
                <div className='n9e-landing-hero-title-highlight'>{t('hero.highlight')}</div>
              </div>
              <div className='n9e-landing-hero-description'>{t('hero.description')}</div>
              <div className='n9e-landing-hero-actions'>
                <a className='n9e-landing-hero-btn n9e-landing-hero-btn-primary' href={landingHero.primaryAction.url} target='_blank' rel='noopener noreferrer'>
                  <BookOpenText className='n9e-landing-hero-btn-icon' strokeWidth={1.9} />
                  <span>{t('hero.primaryAction')}</span>
                </a>
                <button className='n9e-landing-hero-btn n9e-landing-hero-btn-secondary' type='button' onClick={() => handleAskAi()}>
                  <Sparkles className='n9e-landing-hero-btn-icon n9e-landing-ai-breath-icon' strokeWidth={1.9} />
                  <span>{t('hero.secondaryAction')}</span>
                </button>
                <a className='n9e-landing-hero-btn n9e-landing-hero-btn-ghost' href={DOC_LINKS.github} target='_blank' rel='noopener noreferrer'>
                  <Star className='n9e-landing-hero-btn-icon' strokeWidth={1.9} />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
            <div className='n9e-landing-hero-visual'>
              <div className='n9e-landing-hero-window'>
                <div className='n9e-landing-hero-window-bar'>
                  <span className='n9e-landing-hero-window-dot' />
                  <span className='n9e-landing-hero-window-dot' />
                  <span className='n9e-landing-hero-window-dot' />
                </div>
                <img className='n9e-landing-hero-screenshot n9e-landing-hero-screenshot-light' src={landingHero.heroScreenshot} alt='' />
                <img className='n9e-landing-hero-screenshot n9e-landing-hero-screenshot-dark' src={landingHero.heroScreenshotDark} alt='' />
              </div>
            </div>
          </section>

          {/* Section header for the matrix */}
          <div className='n9e-landing-header'>
            <div className='n9e-landing-kicker'>{t('matrix.headerKicker')}</div>
            <div className='n9e-landing-subtitle'>{t('matrix.headerSubtitle')}</div>
          </div>

          {/* Section 2 · 产品矩阵 — nested tinted shell containers wrap white sub-panels */}
          <div className='n9e-landing-matrix'>
            {/* Left tinted shell — violet wash holds scenario + observability panels */}
            <div className='n9e-landing-matrix-main-shell'>
              <section className='n9e-landing-panel n9e-landing-panel-violet n9e-landing-panel-scenario'>
                <div className='n9e-landing-panel-tag'>
                  <TriangleAlert className='n9e-landing-panel-tag-icon' strokeWidth={1.9} />
                  <span>{t('matrix.scenarioTag')}</span>
                </div>
                <div className='n9e-landing-card-grid'>
                  {landingScenarioProducts.map((item, index) => {
                    const Icon = scenarioIcons[index] || Sparkles;
                    const onAction = item.action === 'openAiChat' ? () => handleAskAi() : undefined;
                    const linkProps = makeLinkProps(item.url, history, onAction);
                    return (
                      <a {...linkProps} className='n9e-landing-feature-card' key={item.titleKey}>
                        <span className='n9e-landing-feature-icon'>
                          <Icon strokeWidth={1.8} />
                        </span>
                        <div className='n9e-landing-feature-title'>{t(item.titleKey)}</div>
                        <div className='n9e-landing-feature-description'>{t(item.descriptionKey)}</div>
                      </a>
                    );
                  })}
                </div>
                <div className='n9e-landing-inline-notes'>
                  {landingFootnotes.scenario.map((key, index) => (
                    <React.Fragment key={key}>
                      {index > 0 && <span className='n9e-landing-note-divider'>|</span>}
                      <span>{t(key)}</span>
                    </React.Fragment>
                  ))}
                </div>
              </section>

              <section className='n9e-landing-panel n9e-landing-panel-violet n9e-landing-panel-observability'>
                <div className='n9e-landing-panel-tag'>
                  <Monitor className='n9e-landing-panel-tag-icon' strokeWidth={1.9} />
                  <span>{t('matrix.observabilityTag')}</span>
                </div>
                <div className='n9e-landing-pill-grid'>
                  {landingObservabilityProducts.map((item) => {
                    const linkProps = makeLinkProps(item.url, history);
                    return (
                      <a {...linkProps} className='n9e-landing-pill' key={item.titleKey}>
                        {t(item.titleKey)}
                      </a>
                    );
                  })}
                </div>
                <div className='n9e-landing-caption'>{t(landingFootnotes.observability)}</div>
              </section>
            </div>

            {/* Right tinted shell — pink wash, holds 4 notification cards stacked */}
            <div className='n9e-landing-matrix-duty-shell'>
              <section className='n9e-landing-panel n9e-landing-panel-pink n9e-landing-panel-duty'>
                <div className='n9e-landing-panel-tag'>
                  <Bell className='n9e-landing-panel-tag-icon' strokeWidth={1.9} />
                  <span>{t('matrix.notificationTag')}</span>
                </div>
                <div className='n9e-landing-stack n9e-landing-stack-duty'>
                  {landingNotificationCards.map((item, index) => {
                    const Icon = notificationIcons[index] || Bell;
                    const linkProps = makeLinkProps(item.url, history);
                    return (
                      <a {...linkProps} className='n9e-landing-duty-card' key={item.titleKey}>
                        <span className='n9e-landing-duty-icon-slot'>
                          <Icon className='n9e-landing-duty-icon' strokeWidth={1.9} />
                        </span>
                        <div className='n9e-landing-duty-text'>
                          <div className='n9e-landing-duty-title'>{t(item.titleKey)}</div>
                          <div className='n9e-landing-duty-description'>{t(item.descriptionKey)}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
                <div className='n9e-landing-inline-notes n9e-compact'>
                  {landingFootnotes.notification.map((key, index) => (
                    <React.Fragment key={key}>
                      {index > 0 && <span className='n9e-landing-note-divider'>|</span>}
                      <span>{t(key)}</span>
                    </React.Fragment>
                  ))}
                </div>
              </section>
            </div>

            {/* Vertical arrow indicators between shells */}
            <div className='n9e-landing-matrix-arrow n9e-landing-matrix-arrow-ingest'>
              <span className='n9e-landing-matrix-arrow-bg' aria-hidden />
              <div className='n9e-landing-matrix-arrow-label'>
                <span className='n9e-landing-matrix-arrow-up' aria-hidden />
                <span>{t('matrix.dataIngestArrow')}</span>
              </div>
            </div>
            <div className='n9e-landing-matrix-arrow n9e-landing-matrix-arrow-alert'>
              <span className='n9e-landing-matrix-arrow-bg' aria-hidden />
              <div className='n9e-landing-matrix-arrow-label'>
                <span className='n9e-landing-matrix-arrow-up' aria-hidden />
                <span>{t('matrix.alertEventArrow')}</span>
              </div>
            </div>

            {/* Bottom tinted shell — blue wash, holds collection + integration + infrastructure */}
            <div className='n9e-landing-matrix-data-shell'>
              <div className='n9e-landing-data-grid'>
                <section className='n9e-landing-panel n9e-landing-panel-blue n9e-landing-panel-collection'>
                  <div className='n9e-landing-panel-tag'>
                    <Database className='n9e-landing-panel-tag-icon' strokeWidth={1.9} />
                    <span>{t('matrix.collectionTag')}</span>
                  </div>
                  <a href={landingCollectionProduct.url} target='_blank' rel='noopener noreferrer' className='n9e-landing-collector-card'>
                    <div className='n9e-landing-collector-badge'>
                      <PawPrint strokeWidth={1.8} />
                    </div>
                    <div className='n9e-landing-collector-text'>
                      <div className='n9e-landing-collector-title'>{landingCollectionProduct.title}</div>
                      <div className='n9e-landing-collector-description'>{t(landingCollectionProduct.descriptionKey)}</div>
                    </div>
                  </a>
                  <div className='n9e-landing-caption'>{t(landingCollectionProduct.footerKey)}</div>
                </section>

                <section className='n9e-landing-panel n9e-landing-panel-blue n9e-landing-panel-integration'>
                  <div className='n9e-landing-panel-tag'>
                    <Waypoints className='n9e-landing-panel-tag-icon' strokeWidth={1.9} />
                    <span>{t('matrix.integrationTag')}</span>
                  </div>
                  <div className='n9e-landing-chip-grid'>
                    {landingIntegrationProducts.map((item) => {
                      const linkProps = makeLinkProps(item.url, history);
                      return (
                        <a {...linkProps} className='n9e-landing-integration-chip' key={item.label}>
                          <span className='n9e-landing-integration-chip-logo-wrap'>{item.iconUrl ? <img src={item.iconUrl} alt='' /> : null}</span>
                          <span className='n9e-landing-integration-chip-label'>{item.label}</span>
                        </a>
                      );
                    })}
                  </div>
                  <div className='n9e-landing-caption'>{t(landingFootnotes.integration)}</div>
                </section>
              </div>

              <section className='n9e-landing-panel n9e-landing-panel-blue n9e-landing-panel-infrastructure'>
                <div className='n9e-landing-panel-tag'>
                  <LayoutPanelLeft className='n9e-landing-panel-tag-icon' strokeWidth={1.9} />
                  <span>{t('matrix.infrastructureTag')}</span>
                </div>
                <div className='n9e-landing-infrastructure-grid'>
                  {landingInfrastructureCategories.map((item, index) => {
                    const Icon = infrastructureIcons[index] || Server;
                    return (
                      <article className='n9e-landing-infrastructure-item' key={item.titleKey}>
                        <span className='n9e-landing-icon n9e-landing-icon-blue'>
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
          <section className='n9e-landing-guide'>
            <div className='n9e-landing-guide-header'>
              <div className='n9e-landing-guide-header-left'>
                <h3 className='n9e-landing-guide-title'>{t('quickStart.title')}</h3>
                <a className='n9e-landing-guide-all-docs' href={DOC_LINKS.base} target='_blank' rel='noopener noreferrer'>
                  <BookOpenText className='n9e-landing-guide-all-docs-icon' strokeWidth={1.9} />
                  {t('quickStart.viewAll')}
                </a>
              </div>
            </div>
            <div className='n9e-landing-guide-grid'>
              {landingQuickStartCards.map((item, index) => {
                const Icon = quickStartIcons[index] || Sparkles;
                return (
                  <div key={item.titleKey} className='n9e-landing-quickstart-card'>
                    <div className='n9e-landing-quickstart-card-head'>
                      <div className={classNames('n9e-landing-quickstart-icon', quickStartIconClasses[index])}>
                        <Icon strokeWidth={1.9} />
                      </div>
                      <div className='n9e-landing-quickstart-text'>
                        <h4 className='n9e-landing-quickstart-title'>{t(item.titleKey)}</h4>
                        <p className='n9e-landing-quickstart-description'>{t(item.descriptionKey)}</p>
                      </div>
                    </div>
                    <div className='n9e-landing-quickstart-link-list'>
                      {item.links.map((link) => {
                        const linkLabel = t(link.labelKey);
                        return (
                          <div key={link.labelKey} className='n9e-landing-quickstart-link-row'>
                            <a className='n9e-landing-quickstart-link' href={link.url} target='_blank' rel='noopener noreferrer'>
                              <ArrowRightOutlined className='n9e-landing-quickstart-link-arrow' />
                              <span className='n9e-landing-quickstart-link-label'>{linkLabel}</span>
                            </a>
                            <button
                              type='button'
                              className='n9e-landing-quickstart-ask-ai-btn'
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAskAi(linkLabel);
                              }}
                            >
                              <Sparkles className='n9e-landing-quickstart-ask-ai-icon' strokeWidth={1.9} />
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
          <section className='n9e-landing-section'>
            <div className='n9e-landing-ai-callout'>
              <div className='n9e-landing-ai-callout-inner'>
                <div className='n9e-landing-ai-callout-icon'>
                  <Bot strokeWidth={1.8} />
                </div>
                <div className='n9e-landing-ai-callout-body'>
                  <h3 className='n9e-landing-ai-callout-title'>{t('aiAssistant.title')}</h3>
                  <p className='n9e-landing-ai-callout-description'>{t('aiAssistant.description')}</p>
                  <div className='n9e-landing-ai-capability-list'>
                    {landingAiAssistant.capabilities.map((cap, index) => {
                      const Icon = aiCapabilityIcons[index] || Sparkles;
                      return (
                        <span key={cap.titleKey} className='n9e-landing-ai-capability-tag'>
                          <Icon className='n9e-landing-ai-capability-icon' strokeWidth={1.9} />
                          {t(cap.titleKey)}
                        </span>
                      );
                    })}
                  </div>
                  <button type='button' className='n9e-landing-ai-callout-btn' onClick={() => handleAskAi()}>
                    <Sparkles className='n9e-landing-ai-callout-btn-icon n9e-landing-ai-breath-icon' strokeWidth={1.9} />
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
