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
import { getAlertEventsById, getHistoryEventsById, getAlertEventsByCode } from '@/services/warning';
import { priorityColor } from '@/utils/constant';
import { deleteAlertEventsModal } from '.';
import { parseValues } from '@/pages/alertRules/utils';
import { CommonStateContext } from '@/App';
import Preview from './Preview';
import LogsDetail from './LogsDetail';
import PrometheusDetail from './Detail/Prometheus';
import ElasticsearchDetail from './Detail/Elasticsearch';
import AliyunSLSDetail from './Detail/AliyunSLS';
import Host from './Detail/Host';
import './detail.less';

const { Paragraph } = Typography;
const EventDetailPage: React.FC = () => {
  const { t } = useTranslation('AlertCurEvents');
  const { busiId, eventCode } = useParams<{ busiId: string; eventCode: string }>();
  const [ eventId, setEventId] = useState(0)
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
  const isCurrent = history.location.pathname.includes('alert-cur-events');
  const [eventDetail, setEventDetail] = useState<any>();
  if (eventDetail) eventDetail.cate = eventDetail.cate || 'prometheus'; // TODO: 兼容历史的告警事件
  const parsedEventDetail = parseValues(eventDetail);
  const descriptionInfo = [
    {
      label: t('detail.rule_name'),
      key: 'rule_name',
      render(content, { rule_id }) {
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
      },
    },
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
    { label: t('detail.rule_note'), key: 'rule_note' },
    {
      label: t('detail.datasource_id'),
      key: 'datasource_id',
      render(content) {
        return _.find(datasourceList, (item) => item.id === content)?.name;
      },
    },
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
    { label: t('detail.target_note'), key: 'target_note' },
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
            {eventDetail?.cate === 'elasticsearch' && (
              <Button
                size='small'
                style={{ marginLeft: 16 }}
                onClick={() => {
                  LogsDetail.Elasticsearch({
                    id: eventId,
                    start: eventDetail.trigger_time - 2 * eventDetail.prom_eval_interval,
                    end: eventDetail.trigger_time + eventDetail.prom_eval_interval,
                  });
                }}
              >
                日志详情
              </Button>
            )}
            {eventDetail?.cate === 'aliyun-sls' && (
              <Button
                size='small'
                style={{ marginLeft: 16 }}
                onClick={() => {
                  LogsDetail.AliyunSLS({
                    id: eventId,
                    start: eventDetail.trigger_time - 2 * eventDetail.prom_eval_interval,
                    end: eventDetail.trigger_time + eventDetail.prom_eval_interval,
                  });
                }}
              >
                日志详情
              </Button>
            )}
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
    ...(eventDetail?.cate === 'elasticsearch' ? ElasticsearchDetail() : [false]),
    ...(eventDetail?.cate === 'aliyun-sls' ? AliyunSLSDetail() : [false]),
    ...(eventDetail?.cate === 'host' ? Host(t, commonState) : [false]),
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
    {
      label: t('detail.runbook_url'),
      key: 'runbook_url',
      render(url) {
        return (
          <a href={url} target='_balank'>
            {url}
          </a>
        );
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
    const requestPromise = isHistory ? 
      getHistoryEventsById(busiId, eventCode) : 
      ( isCurrent ? getAlertEventsById(busiId, eventCode) : getAlertEventsByCode(busiId, eventCode));
    requestPromise.then((res) => {
      setEventId(res.dat.id)
      setEventDetail(res.dat);
    });
  }, [busiId, eventCode]);

  return (
    <PageLayout title={isHistory?t('detail.title'):t('title')} showBack backPath={isHistory?'/alert-his-events':'/alert-cur-events'}>
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
                {parsedEventDetail.rule_algo || parsedEventDetail.cate === 'elasticsearch' || parsedEventDetail.cate === 'aliyun-sls' ? (
                  <Preview
                    data={parsedEventDetail}
                    triggerTime={eventDetail.trigger_time}
                    onClick={(event, datetime) => {
                      if (parsedEventDetail.cate === 'elasticsearch') {
                        LogsDetail.Elasticsearch({
                          id: eventId,
                          start: moment(datetime).unix() - 2 * eventDetail.prom_eval_interval,
                          end: moment(datetime).unix() + eventDetail.prom_eval_interval,
                        });
                      } else if (parsedEventDetail.cate === 'aliyun-sls') {
                        LogsDetail.AliyunSLS({
                          id: eventId,
                          start: moment(datetime).unix() - 2 * eventDetail.prom_eval_interval,
                          end: moment(datetime).unix() + eventDetail.prom_eval_interval,
                        });
                      }
                    }}
                  />
                ) : null}
                {descriptionInfo
                  .filter((item: any) => {
                    if (!item) return false;
                    return parsedEventDetail.is_recovered ? true : item.key !== 'recover_time';
                  })
                  .map(({ label, key, render }: any, i) => {
                    return (
                      <div className='desc-row' key={key + i}>
                        <div className='desc-label'>{label}：</div>
                        <div className='desc-content'>{render ? render(parsedEventDetail[key], parsedEventDetail) : parsedEventDetail[key]}</div>
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
