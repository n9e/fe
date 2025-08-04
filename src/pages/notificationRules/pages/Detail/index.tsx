import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Row, Col, Select, Card } from 'antd';

import PageLayout from '@/components/pageLayout';

import { NS, CN } from '../../constants';
import { getNotifyStatistics, NotifyStatistics } from '../../services';
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

  useEffect(() => {
    if (!id) return;
    getNotifyStatistics(_.toNumber(id), days).then((res) => {
      setNotifyStatistics(res);
    });
  }, [id, days]);

  const contentList: Record<string, React.ReactNode> = {
    events: <Events id={_.toNumber(id)} days={days} />,
    rules: <AlertRules id={_.toNumber(id)} />,
    sub_rules: <SubscribeRules id={_.toNumber(id)} />,
  };

  return (
    <PageLayout title={t('title')} showBack backPath={`/${NS}`}>
      <div className={`n9e ${CN}`}>
        <div className='mb-2 flex justify-end'>
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
        </div>
        <Row gutter={16}>
          <Col span={8}>
            <div className='w-full rounded n9e-border-base n9e-fill-color-2 px-4 py-2'>
              <div className='flex items-center gap-1'>{t('statistics.total_notify_events', { days })}</div>
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
                    {notifyStatistics?.total_notify_events_change}
                  </div>
                )}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className='w-full rounded n9e-border-base n9e-fill-color-2 px-4 py-2'>
              <div className='flex items-center gap-1'>{t('statistics.reduced_notify_events', { days })}</div>
              <div className='my-2 flex flex-wrap items-end'>
                <div className='mr-2 text-l4 text-title'>{notifyStatistics?.reduced_notify_events}</div>
                {notifyStatistics?.reduced_notify_events_change && (
                  <div
                    className='flex cursor-default items-center'
                    style={{
                      color: notifyStatistics?.reduced_notify_events_change > 0 ? 'var(--fc-fill-success)' : 'var(--fc-fill-error)',
                    }}
                  >
                    {notifyStatistics?.reduced_notify_events_change > 0 ? <UpIcon className='mr-0.5 h-3.5 w-3.5 ' /> : <DownIcon className='mr-0.5 h-3.5 w-3.5' />}
                    {notifyStatistics?.reduced_notify_events_change}
                  </div>
                )}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className='w-full rounded n9e-border-base n9e-fill-color-2 px-4 py-2'>
              <div className='flex items-center gap-1'>{t('statistics.noise_reduction_ratio', { days })}</div>
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
                    {notifyStatistics?.noise_reduction_ratio_change} %
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
        <Card
          size='small'
          className='mt-4 n9e-border-color n9e-notification-rule-detail-list'
          style={{ width: '100%' }}
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
          {contentList[activeTabKey]}
        </Card>
      </div>
    </PageLayout>
  );
}
