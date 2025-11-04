import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Select, Card, Space, Tag, Tooltip, Button } from 'antd';
import { InfoCircleOutlined, TeamOutlined } from '@ant-design/icons';

import PageLayout from '@/components/pageLayout';
import { getTeamInfoList } from '@/services/manage';

// @ts-ignore
import { getBrainLicense } from 'plus:/components/License/services';

import { NS, CN } from '../../constants';
import { getNotifyStatistics, NotifyStatistics, getItem, RuleItem } from '../../services';
import { UpIcon, DownIcon } from '../../components/Icon';
import Events from './Events';
import AlertRules from './AlertRules';
import SubscribeRules from './SubscribeRules';

export default function Detail() {
  const { t } = useTranslation(NS);
  const { id } = useParams<{ id: string }>();
  const [days, setDays] = useState(7);
  const [notifyStatistics, setNotifyStatistics] = useState<NotifyStatistics>();
  const [activeTabKey, setActiveTabKey] = useState('events');
  const [itemData, setData] = useState<RuleItem>();
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);
  const [eventAggr, setEventAggr] = React.useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    getItem(_.toNumber(id)).then((res) => {
      setData(res);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !eventAggr) return;
    getNotifyStatistics(_.toNumber(id), days).then((res) => {
      setNotifyStatistics(res);
    });
  }, [id, days, eventAggr]);

  useEffect(() => {
    getTeamInfoList().then((res) => {
      setUserGroups(res.dat ?? []);
    });
    if (getBrainLicense) {
      getBrainLicense().then((res) => {
        if (res?.['event-aggr'] === true) {
          setEventAggr(true);
        }
      });
    }
  }, []);

  const contentList: Record<string, React.ReactNode> = {
    events: <Events id={_.toNumber(id)} days={days} />,
    rules: <AlertRules id={_.toNumber(id)} />,
    sub_rules: <SubscribeRules id={_.toNumber(id)} />,
  };

  return (
    <PageLayout title={t('title')} showBack backPath={`/${NS}`}>
      <div className={`n9e ${CN} overflow-hidden`}>
        <div className='h-full flex flex-col gap-4'>
          <div className='flex-shrink-0 flex justify-between'>
            <Space>
              <Tag className='mr-0'>
                <Space>
                  <span>{t('common:table.name')}:</span>
                  {itemData?.name}
                </Space>
              </Tag>
              <Tag className='mr-0' color={itemData?.enable ? 'success' : 'error'}>
                {itemData?.enable ? t('common:enabling') : t('common:disabling')}
              </Tag>
              {_.map(itemData?.user_group_ids, (item) => {
                const name = _.find(userGroups, { id: item })?.name;
                return (
                  <Tooltip key={item} title={!name ? t('user_group_id_invalid_tip') : undefined}>
                    <Tag className='mr-0' key={item}>
                      <Space size={2}>
                        <TeamOutlined />
                        {name || item}
                      </Space>
                    </Tag>
                  </Tooltip>
                );
              })}
            </Space>
            <Space>
              <Link
                to={{
                  pathname: `/${NS}/edit/${itemData?.id}`,
                }}
              >
                <Button type='primary'>{t('common:btn.edit')}</Button>
              </Link>
              {eventAggr && (
                <Select
                  value={days}
                  options={[
                    {
                      label: t('common:last.1.days'),
                      value: 1,
                    },
                    {
                      label: t('common:last.7.days'),
                      value: 7,
                    },
                    {
                      label: t('common:last.14.days'),
                      value: 14,
                    },
                    {
                      label: t('common:last.30.days'),
                      value: 30,
                    },
                  ]}
                  onChange={setDays}
                  dropdownMatchSelectWidth={false}
                  className='w-32'
                />
              )}
            </Space>
          </div>
          {eventAggr && (
            <div className='flex-shrink-0'>
              <Row gutter={16}>
                <Col span={8}>
                  <div className='w-full h-[88px] rounded fc-border bg-fc-100 px-4 py-2'>
                    <div className='flex items-center gap-2'>
                      {t('statistics.total_notify_events', { days })}
                      <Tooltip overlayClassName='ant-tooltip-max-width-400' title={<Trans ns={NS} i18nKey='statistics.total_notify_events_tip' components={{ b: <strong /> }} />}>
                        <InfoCircleOutlined />
                      </Tooltip>
                    </div>
                    <div className='my-2 flex flex-wrap items-end'>
                      <div className='mr-2 text-l4 text-title'>{notifyStatistics?.total_notify_events}</div>
                      {notifyStatistics?.total_notify_events_change && (
                        <div
                          className='flex cursor-default items-center'
                          style={{
                            color: notifyStatistics?.total_notify_events_change < 0 ? 'var(--fc-fill-success)' : 'var(--fc-fill-error)',
                          }}
                        >
                          {notifyStatistics?.total_notify_events_change > 0 ? <UpIcon className='mr-0.5 h-3.5 w-3.5 ' /> : <DownIcon className='mr-0.5 h-3.5 w-3.5' />}
                          {Math.abs(notifyStatistics?.total_notify_events_change)}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className='w-full h-[88px] rounded fc-border bg-fc-100 px-4 py-2'>
                    <div className='flex items-center gap-2'>
                      {t('statistics.noise_reduction_ratio', { days })}
                      <Tooltip overlayClassName='ant-tooltip-max-width-400' title={<Trans ns={NS} i18nKey='statistics.noise_reduction_ratio_tip' components={{ b: <strong /> }} />}>
                        <InfoCircleOutlined />
                      </Tooltip>
                    </div>
                    <div className='my-2 flex flex-wrap items-end'>
                      <div className='mr-2 text-l4 text-title'>{notifyStatistics?.noise_reduction_ratio} %</div>
                      {notifyStatistics?.noise_reduction_ratio_change && (
                        <div
                          className='flex cursor-default items-center'
                          style={{
                            color: notifyStatistics?.noise_reduction_ratio_change > 0 ? 'var(--fc-fill-success)' : 'var(--fc-fill-error)',
                          }}
                        >
                          {notifyStatistics?.noise_reduction_ratio_change > 0 ? <UpIcon className='mr-0.5 h-3.5 w-3.5 ' /> : <DownIcon className='mr-0.5 h-3.5 w-3.5' />}
                          {Math.abs(notifyStatistics?.noise_reduction_ratio_change)} %
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className='w-full h-[88px] rounded fc-border bg-fc-100 px-4 py-2'>
                    <div className='flex items-center gap-2'>
                      {t('statistics.escalation_events', { days })}
                      <Tooltip overlayClassName='ant-tooltip-max-width-400' title={<Trans ns={NS} i18nKey='statistics.escalation_events_tip' components={{ b: <strong /> }} />}>
                        <InfoCircleOutlined />
                      </Tooltip>
                    </div>
                    <div className='my-2 flex flex-wrap items-end'>
                      <div className='mr-2 text-l4 text-title'>{notifyStatistics?.escalation_events}</div>
                      {notifyStatistics?.escalation_events_change && (
                        <div
                          className='flex cursor-default items-center'
                          style={{
                            color: notifyStatistics?.escalation_events_change > 0 ? 'var(--fc-fill-error)' : 'var(--fc-fill-success)',
                          }}
                        >
                          {notifyStatistics?.escalation_events_change > 0 ? <UpIcon className='mr-0.5 h-3.5 w-3.5 ' /> : <DownIcon className='mr-0.5 h-3.5 w-3.5' />}
                          {Math.abs(notifyStatistics?.escalation_events_change)}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
          <Card
            size='small'
            className='fc-border n9e-notification-rule-detail-list w-full min-h-0'
            bodyStyle={{
              height: 'calc(100% - 36px)',
            }}
            tabList={[
              {
                key: 'events',
                tab: t('tabs.events'),
              },
              {
                key: 'rules',
                tab: t('tabs.rules'),
              },
              {
                key: 'sub_rules',
                tab: t('tabs.sub_rules'),
              },
            ]}
            activeTabKey={activeTabKey}
            onTabChange={(key) => {
              setActiveTabKey(key);
            }}
            tabProps={{
              size: 'small',
              destroyInactiveTabPane: true,
            }}
          >
            <div className='overflow-y-auto h-full'>{contentList[activeTabKey]}</div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
