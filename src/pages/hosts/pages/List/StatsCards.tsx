import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import { Col, Row, Space, Empty } from 'antd';
import { SyncOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import classNames from 'classnames';

import { SIZE } from '@/utils/constant';

import { NS, STATS_COLLAPSED_KEY } from '../../constants';
import { getStats } from '../../services';
import numberToLocaleString from '../../utils/numberToLocaleString';
import UsageDistributionChart from './UsageDistributionChart';
import VersionsDistributionChart from './VersionsDistributionChart';

interface Props {
  gids?: string;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function StatsCards(props: Props) {
  const { t } = useTranslation(NS);
  const { gids, collapsed, setCollapsed } = props;

  const { data: stats, loading } = useRequest(
    () => {
      return getStats({ gids });
    },
    {
      refreshDeps: [gids],
    },
  );

  const alivePercentage = stats?.count ? Math.round((stats.alive_count / stats.count) * 100) : 0;
  const deadPercentage = stats?.count ? Math.round((stats.dead_count / stats.count) * 100) : 0;
  const ringR = 18;
  const ringCircumference = 2 * Math.PI * ringR;

  return (
    <div className='relative flex-shrink-0'>
      <div
        className={classNames({
          hidden: collapsed,
          'mb-0': collapsed,
          block: !collapsed,
          'mb-4': !collapsed,
        })}
      >
        <Row gutter={SIZE * 2}>
          <Col span={6}>
            <div className='fc-border rounded-lg bg-fc-100 h-[164px] p-4 relative flex flex-col'>
              <div className='mb-3 text-l1 leading-none shrink-0'>{t('count')}</div>
              <div className='flex-1 min-h-0 overflow-hidden'>
                {_.isNumber(stats?.count) ? (
                  <>
                    <div className='text-l4 font-bold text-title leading-none mb-3'>{numberToLocaleString(stats?.count)}</div>
                    <Row gutter={SIZE}>
                      <Col span={12}>
                        <div className='rounded-lg bg-fc-50 h-[66px] flex items-center p-3'>
                          <div className='flex-1 min-w-0'>
                            <div className='truncate'>{t('alive_count')}</div>
                            <div className='font-bold text-title'>{numberToLocaleString(stats?.alive_count)}</div>
                          </div>
                          <svg width='48' height='48' viewBox='0 0 50 50' className='flex-shrink-0'>
                            <circle cx='25' cy='25' r={ringR} fill='none' stroke='var(--fc-border-color)' strokeWidth='4' />
                            {alivePercentage > 0 && (
                              <circle
                                cx='25'
                                cy='25'
                                r={ringR}
                                fill='none'
                                stroke='var(--fc-fill-success)'
                                strokeWidth='4'
                                strokeDasharray={`${(ringCircumference * alivePercentage) / 100} ${ringCircumference}`}
                                strokeLinecap='round'
                                transform='rotate(-90 25 25)'
                              />
                            )}
                            <text x='25' y='29' textAnchor='middle' fontSize='11' fontWeight='bold' fill='var(--fc-text-1)'>
                              {alivePercentage}%
                            </text>
                          </svg>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className='rounded-lg bg-fc-50 h-[66px] flex items-center p-3'>
                          <div className='flex-1 min-w-0'>
                            <div className='truncate'>{t('dead_count')}</div>
                            <div className='font-bold text-title'>{numberToLocaleString(stats?.dead_count)}</div>
                          </div>
                          <svg width='48' height='48' viewBox='0 0 50 50' className='flex-shrink-0'>
                            <circle cx='25' cy='25' r={ringR} fill='none' stroke='var(--fc-border-color)' strokeWidth='4' />
                            {deadPercentage > 0 && (
                              <circle
                                cx='25'
                                cy='25'
                                r={ringR}
                                fill='none'
                                stroke='var(--fc-fill-error)'
                                strokeWidth='4'
                                strokeDasharray={`${(ringCircumference * deadPercentage) / 100} ${ringCircumference}`}
                                strokeLinecap='round'
                                transform='rotate(-90 25 25)'
                              />
                            )}
                            <text x='25' y='29' textAnchor='middle' fontSize='11' fontWeight='bold' fill='var(--fc-text-1)'>
                              {deadPercentage}%
                            </text>
                          </svg>
                        </div>
                      </Col>
                    </Row>
                  </>
                ) : (
                  <div className='w-full h-full flex justify-center items-center'>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </div>
                )}
              </div>
              {loading && (
                <div className='absolute right-1 top-1'>
                  <SyncOutlined spin />
                </div>
              )}
            </div>
          </Col>
          <Col span={6}>
            <div className='fc-border rounded-lg bg-fc-100 h-[164px] p-4 relative flex flex-col'>
              <div className='mb-3 text-l1 leading-none shrink-0'>{t('memory_usage')}</div>
              <div className='flex-1 min-h-0 overflow-hidden'>
                <UsageDistributionChart data={stats?.mem_usage} chartId='mem' />
              </div>
              {loading && (
                <div className='absolute right-1 top-1'>
                  <SyncOutlined spin />
                </div>
              )}
            </div>
          </Col>
          <Col span={6}>
            <div className='fc-border rounded-lg bg-fc-100 h-[164px] p-4 relative flex flex-col'>
              <div className='mb-3 text-l1 leading-none shrink-0'>{t('cpu_usage')}</div>
              <div className='flex-1 min-h-0 overflow-hidden'>
                <UsageDistributionChart data={stats?.cpu_usage} chartId='cpu' />
              </div>
              {loading && (
                <div className='absolute right-1 top-1'>
                  <SyncOutlined spin />
                </div>
              )}
            </div>
          </Col>
          <Col span={6}>
            <div className='fc-border rounded-lg bg-fc-100 h-[164px] p-4 relative'>
              <div className='mb-3 text-l1 leading-none'>{t('versions')}</div>
              <div className='flex-1 min-h-0 overflow-hidden h-[104px]'>
                <VersionsDistributionChart
                  data={stats?.versions}
                  renderTooltip={(bar) => {
                    if (bar.otherVersions) {
                      return (
                        <div>
                          <div className='flex justify-between'>
                            <Space align='center'>
                              <div
                                className='w-[6px] h-[16px] rounded-md'
                                style={{
                                  backgroundColor: bar.color,
                                }}
                              />
                              <span className='text-l1 text-title'>{bar.label}</span>
                            </Space>
                            <Space>
                              <span>{bar.otherVersions?.length}</span>
                              <span>versions</span>
                            </Space>
                          </div>
                          <div
                            className='my-2'
                            style={{
                              borderBottom: '1px solid var(--fc-border-color)',
                            }}
                          />
                          {_.map(_.slice(_.orderBy(bar.otherVersions, 'value', 'desc'), 0, 10), (b) => (
                            <div key={b.label} className='flex justify-between mb-1'>
                              <span>{b.label || '(empty)'}</span>
                              <span className='text-l1 text-title'>
                                <Space size={16}>
                                  <span>{b.percent}</span>
                                  <span>{numberToLocaleString(b.value)}</span>
                                </Space>
                              </span>
                            </div>
                          ))}
                          {bar.otherVersions.length > 10 && (
                            <div className='flex justify-between'>
                              <span>...</span>
                              <span className='text-l1 text-title'>...</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
                      <div>
                        <div className='mb-2'>
                          <Space align='center'>
                            <div
                              className='w-[6px] h-[16px] rounded-md'
                              style={{
                                backgroundColor: bar.color,
                              }}
                            />
                            <span className='text-l1 text-title'>{bar.percent}</span>
                          </Space>
                        </div>
                        <div
                          className='my-2'
                          style={{
                            borderBottom: '1px solid var(--fc-border-color)',
                          }}
                        />
                        <div className='flex justify-between'>
                          <span>{bar.label}</span>
                          <span className='text-l1 text-title'>{numberToLocaleString(bar.value)}</span>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
              {loading && (
                <div className='absolute right-1 top-1'>
                  <SyncOutlined spin />
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>
      <div
        className={classNames(
          'cursor-pointer absolute left-[50%] translate-x-[-50%] w-[58px] h-[10px] rounded-md flex justify-center items-center bg-fc-300 hover:bg-fc-400 bottom-[3px]',
        )}
        onClick={() =>
          setCollapsed((c) => {
            const newCollapsed = !c;
            window.localStorage.setItem(STATS_COLLAPSED_KEY, newCollapsed.toString());
            return newCollapsed;
          })
        }
      >
        {collapsed ? <DownOutlined /> : <UpOutlined />}
      </div>
    </div>
  );
}
