/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Drawer, Space, Table, Tooltip } from 'antd';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { getEventNotifyRecords, DatasourceItem } from './services';

interface Props {
  eventId: number;
}

export default function index(props: Props) {
  const { t } = useTranslation('AlertCurEvents');
  const { eventId } = props;
  const [data, setData] = useState<{
    alertRulesRecords: DatasourceItem[];
    alertSubscribesRecords: DatasourceItem[];
  }>();
  const [visible, setVisible] = useState(false);
  const columns = [
    {
      title: t('detail.event_notify_records.notify_rule_id'),
      dataIndex: 'notify_rule_id',
      key: 'notify_rule_id',
      render: (val) => {
        return (
          <Link target='_blank' to={`/notification-rules/edit/${val}`}>
            {val}
          </Link>
        );
      },
    },
    {
      title: t('detail.event_notify_records.channel'),
      dataIndex: 'channel',
      key: 'channel',
    },
    {
      title: t('detail.event_notify_records.username'),
      dataIndex: 'username',
      key: 'username',
      width: 70,
      render: (val) => {
        return val || '-';
      },
    },
    {
      title: t('detail.event_notify_records.target'),
      dataIndex: 'target',
      key: 'target',
      render: (val, record) => {
        if (_.includes(record.detail, 'event is aggregated')) {
          // 从 record.detail 里解析出 aggr_key，他的格式是这样的 'event is aggregated, aggr_key: ${aggr_key}'
          const matched = record.detail.match(/aggr_key:\s*([^\s]*)/);
          if (matched && matched.length >= 2) {
            const aggr_key = matched[1];
            return (
              <Link target='_blank' to={`/alert-aggr-events?aggr_key=${aggr_key}`}>
                {aggr_key}
              </Link>
            );
          }
          return val;
        }
        return val;
      },
    },
    {
      title: t('detail.event_notify_records.status'),
      dataIndex: 'detail',
      key: 'detail',
      width: 400,
      ellipsis: {
        showTitle: false,
      },
      render: (val) => (
        <Tooltip placement='topLeft' title={val}>
          {val}
        </Tooltip>
      ),
    },
  ];

  useEffect(() => {
    if (eventId && visible) {
      getEventNotifyRecords(eventId)
        .then((res) => {
          const alertRulesRecords: DatasourceItem[] = [];
          _.forEach(res.notifies, (value, key) => {
            _.forEach(value, (item) => {
              alertRulesRecords.push({
                ...item,
                channel: key,
              });
            });
          });
          const alertSubscribesRecords: DatasourceItem[] = [];
          _.forEach(res.sub_rules, (item) => {
            _.forEach(item.notifies, (value, key) => {
              _.forEach(value, (subItem) => {
                alertSubscribesRecords.push({
                  ...subItem,
                  channel: key,
                  sub_id: item.sub_id,
                });
              });
            });
          });
          setData({
            alertRulesRecords,
            alertSubscribesRecords,
          });
        })
        .catch(() => {
          setData(undefined);
        });
    } else {
      setData(undefined);
    }
  }, [eventId, visible]);

  return (
    <div>
      <div className='desc-row'>
        <div className='desc-label'>{t('detail.event_notify_records.label')}：</div>
        <div className='desc-content'>
          <a
            onClick={() => {
              setVisible(true);
            }}
          >
            {t('detail.event_notify_records.view')}
          </a>
        </div>
      </div>
      <Drawer
        title={t('detail.event_notify_records.result_title')}
        placement='right'
        onClose={() => {
          setVisible(false);
        }}
        visible={visible}
        width='90%'
        closable={false}
      >
        <Card className='mb2' size='small' title={<Space>{t('detail.event_notify_records.alert_rule_notify_records')}</Space>}>
          <Table size='small' tableLayout='auto' scroll={{ x: 'max-content' }} columns={columns} dataSource={data?.alertRulesRecords} />
        </Card>
        <Card size='small' title={<Space>{t('detail.event_notify_records.subscription_rule_notify_records')}</Space>}>
          <Table
            size='small'
            tableLayout='auto'
            scroll={{ x: 'max-content' }}
            columns={_.concat(
              {
                title: t('detail.event_notify_records.sub_id'),
                dataIndex: 'sub_id',
                key: 'sub_id',
                width: 70,
                render: (val) => {
                  return (
                    <Link target='_blank' to={`/alert-subscribes/edit/${val}`}>
                      {val}
                    </Link>
                  );
                },
              } as any,
              columns,
            )}
            dataSource={data?.alertSubscribesRecords}
          />
        </Card>
      </Drawer>
    </div>
  );
}
