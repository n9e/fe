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
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import moment from 'moment';
import _ from 'lodash';
import queryString from 'query-string';
import { Button, Card, message, Space, Spin, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { getAlertEventsById, getHistoryEventsById } from '@/services/warning';
import { priorityColor } from '@/utils/constant';
import { deleteAlertEventsModal } from '.';
import { CommonStateContext } from '@/App';
// @ts-ignore
import plusEventDetail from 'plus:/parcels/Event/eventDetail';
// @ts-ignore
import PlusPreview from 'plus:/parcels/Event/Preview';
// @ts-ignore
import PlusLogsDetail from 'plus:/parcels/Event/LogsDetail';
import PrometheusDetail from './Detail/Prometheus';
import Host from './Detail/Host';
import './detail.less';
import LokiDetail from './Detail/Loki';

const { Paragraph } = Typography;
const EventDetailPage: React.FC = () => {
  const { t } = useTranslation('AlertCurEvents');
  const { busiId, eventId } = useParams<{ busiId: string; eventId: string }>();
  const commonState = useContext(CommonStateContext);
  const { busiGroups, datasourceList } = commonState;
  const handleNavToWarningList = (id) => {
    if (busiGroups.find((item) => item.id === id)) {
      history.push(`/alert-rules?id=${id}`);
    } else {
      message.error(t('detail.buisness_not_exist'));
    }
  };
  const history = useHistory();
  const isHistory = history.location.pathname.includes('alert-his-events');
  const [eventDetail, setEventDetail] = useState<any>();
  if (eventDetail) eventDetail.cate = eventDetail.cate || 'prometheus'; // TODO: 兼容历史的告警事件
  const descriptionInfo = [
    {
      label: t('detail.rule_name'),
      key: 'rule_name',
      render(content, { rule_id }) {
        if (!_.includes(['firemap', 'northstar'], eventDetail?.rule_prod)) {
          return (
            <Link
              to={{
                pathname: `/alert-rules/edit/${rule_id}`,
              }}
              target='_blank'
            >
              {content}
            </Link>
          );
        }
        return content;
      },
    },
    ...(!_.includes(['firemap', 'northstar'], eventDetail?.rule_prod)
      ? [
          {
            label: t('detail.group_name'),
            key: 'group_name',
            render(content, { group_id }) {
              return (
                <Button size='small' type='link' className='rule-link-btn' onClick={() => handleNavToWarningList(group_id)}>
                  {content}
                </Button>
              );
            },
          },
        ]
      : [
          {
            label: t('detail.detail_url'),
            key: 'rule_config',
            render(val) {
              const detail_url = _.get(val, 'detail_url');
              return (
                <a href={detail_url} target='_blank'>
                  {detail_url}
                </a>
              );
            },
          },
        ]),
    { label: t('detail.rule_note'), key: 'rule_note' },
    ...(!_.includes(['firemap', 'northstar'], eventDetail?.rule_prod)
      ? [
          {
            label: t('detail.datasource_id'),
            key: 'datasource_id',
            render(content) {
              return _.find(datasourceList, (item) => item.id === content)?.name;
            },
          },
        ]
      : [false]),
    {
      label: t('detail.severity'),
      key: 'severity',
      render: (severity) => {
        return <Tag color={priorityColor[severity - 1]}>S{severity}</Tag>;
      },
    },
    {
      label: t('detail.is_recovered'),
      key: 'is_recovered',
      render(isRecovered) {
        return <Tag color={isRecovered ? 'green' : 'red'}>{isRecovered ? 'Recovered' : 'Triggered'}</Tag>;
      },
    },
    {
      label: t('detail.tags'),
      key: 'tags',
      render(tags) {
        return tags
          ? tags.map((tag) => (
              <Tag color='purple' key={tag}>
                {tag}
              </Tag>
            ))
          : '';
      },
    },
    ...(!_.includes(['firemap', 'northstar'], eventDetail?.rule_prod) ? [{ label: t('detail.target_note'), key: 'target_note' }] : [false]),
    {
      label: t('detail.trigger_time'),
      key: 'trigger_time',
      render(time) {
        return moment(time * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      label: t('detail.trigger_value'),
      key: 'trigger_value',
      render(val) {
        return (
          <span>
            {val}
            <PlusLogsDetail data={eventDetail} />
          </span>
        );
      },
    },
    {
      label: t('detail.recover_time'),
      key: 'recover_time',
      render(time) {
        return moment((time || 0) * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    // {
    //   label: t('detail.rule_algo'),
    //   key: 'rule_algo',
    //   render(text) {
    //     if (text) {
    //       return t('detail.rule_algo_anomaly');
    //     }
    //     return t('detail.rule_algo_threshold');
    //   },
    // },
    {
      label: t('detail.cate'),
      key: 'cate',
    },
    ...(eventDetail?.cate === 'prometheus'
      ? PrometheusDetail({
          eventDetail,
          history,
        })
      : [false]),
    ...(eventDetail?.cate === 'loki'
      ? LokiDetail({
          eventDetail,
          history,
        })
      : [false]),
    ...(eventDetail?.cate === 'host' ? Host(t, commonState) : [false]),
    ...(plusEventDetail(eventDetail?.cate, t) || []),
    {
      label: t('detail.prom_eval_interval'),
      key: 'prom_eval_interval',
      render(content) {
        return `${content} s`;
      },
    },
    {
      label: t('detail.prom_for_duration'),
      key: 'prom_for_duration',
      render(content) {
        return `${content} s`;
      },
    },
    {
      label: t('detail.notify_channels'),
      key: 'notify_channels',
      render(channels) {
        return channels.join(' ');
      },
    },
    {
      label: t('detail.notify_groups_obj'),
      key: 'notify_groups_obj',
      render(groups) {
        return groups ? groups.map((group) => <Tag color='purple'>{group.name}</Tag>) : '';
      },
    },
    {
      label: t('detail.callbacks'),
      key: 'callbacks',
      render(callbacks) {
        return callbacks
          ? callbacks.map((callback) => (
              <Tag>
                <Paragraph copyable style={{ margin: 0 }}>
                  {callback}
                </Paragraph>
              </Tag>
            ))
          : '';
      },
    },
  ];

  if (eventDetail?.annotations) {
    _.forEach(eventDetail.annotations, (value, key) => {
      descriptionInfo.push({
        label: key,
        key,
        render: () => {
          if (value.indexOf('http') === 0) {
            return (
              <a href={value} target='_blank'>
                {value}
              </a>
            );
          }
          return <span>{value}</span>;
        },
      });
    });
  }

  useEffect(() => {
    const requestPromise = isHistory ? getHistoryEventsById(eventId) : getAlertEventsById(eventId);
    requestPromise.then((res) => {
      setEventDetail(res.dat);
    });
  }, [busiId, eventId]);

  return (
    <PageLayout title={t('detail.title')} showBack backPath='/alert-his-events'>
      <div className='event-detail-container'>
        <Spin spinning={!eventDetail}>
          <Card
            size='small'
            className='desc-container'
            title={t('detail.card_title')}
            actions={[
              <div className='action-btns'>
                <Space>
                  <Button
                    type='primary'
                    onClick={() => {
                      history.push({
                        pathname: '/alert-mutes/add',
                        search: queryString.stringify({
                          busiGroup: eventDetail.group_id,
                          prod: eventDetail.rule_prod,
                          cate: eventDetail.cate,
                          datasource_ids: [eventDetail.datasource_id],
                          tags: eventDetail.tags,
                        }),
                      });
                    }}
                  >
                    {t('shield')}
                  </Button>
                  {!isHistory && (
                    <Button
                      danger
                      onClick={() => {
                        if (eventDetail.group_id) {
                          deleteAlertEventsModal(
                            [Number(eventId)],
                            () => {
                              history.replace('/alert-cur-events');
                            },
                            t,
                          );
                        } else {
                          message.warn('该告警未返回业务组ID');
                        }
                      }}
                    >
                      {t('common:btn.delete')}
                    </Button>
                  )}
                </Space>
              </div>,
            ]}
          >
            {eventDetail && (
              <div>
                <PlusPreview data={eventDetail} />
                {descriptionInfo
                  .filter((item: any) => {
                    if (!item) return false;
                    return eventDetail.is_recovered ? true : item.key !== 'recover_time';
                  })
                  .map(({ label, key, render }: any, i) => {
                    return (
                      <div className='desc-row' key={key + i}>
                        <div className='desc-label'>{label}：</div>
                        <div className='desc-content'>{render ? render(eventDetail[key], eventDetail) : eventDetail[key]}</div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        </Spin>
      </div>
    </PageLayout>
  );
};

export default EventDetailPage;
