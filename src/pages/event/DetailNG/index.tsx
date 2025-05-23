import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import moment from 'moment';
import _ from 'lodash';
import { Button, message, Spin, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CommonStateContext, basePrefix } from '@/App';
import TDengineDetail from '@/plugins/TDengine/Event';
import { Event as ElasticsearchDetail } from '@/plugins/elasticsearch';
import { getESIndexPatterns } from '@/pages/log/IndexPatterns/services';
import { DatasourceCateEnum } from '@/utils/constant';

import EventNotifyRecords from '../EventNotifyRecords';
import TaskTpls from '../TaskTpls';
import PrometheusDetail from '../Detail/Prometheus';
import Host from '../Detail/Host';
import LokiDetail from '../Detail/Loki';

// @ts-ignore
import plusEventDetail from 'plus:/parcels/Event/eventDetail';
// @ts-ignore
import PlusPreview from 'plus:/parcels/Event/Preview';
// @ts-ignore
import PlusLogsDetail from 'plus:/parcels/Event/LogsDetail';

import '../detail.less';

const { Paragraph } = Typography;

interface Props {
  data: any;
  showGraph?: boolean;
}

export default function DetailNG(props: Props) {
  const { t } = useTranslation('AlertCurEvents');
  const commonState = useContext(CommonStateContext);
  const { busiGroups, datasourceList } = commonState;
  const { data: eventDetail, showGraph } = props;
  const handleNavToWarningList = (id) => {
    if (busiGroups.find((item) => item.id === id)) {
      window.open(`${basePrefix}/alert-rules?ids=${id}&isLeaf=true`);
    } else {
      message.error(t('detail.buisness_not_exist'));
    }
  };
  const history = useHistory();

  if (eventDetail) eventDetail.cate = eventDetail.cate || 'prometheus'; // TODO: 兼容历史的告警事件

  const [indexPatterns, setIndexPatterns] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (eventDetail?.cate === DatasourceCateEnum.elasticsearch) {
      getESIndexPatterns().then((res) => {
        setIndexPatterns(res);
      });
    }
  }, [eventDetail?.cate]);

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
        const severityMap = {
          1: {
            color: '#cc0204',
            text: '（Critical）',
          },
          2: {
            color: '#fd6e00',
            text: '（Warning）',
          },
          3: {
            color: '#f2d204',
            text: '（Info）',
          },
        };
        return (
          <Tag color={severityMap[severity].color}>
            S{severity} {severityMap[severity].text}
          </Tag>
        );
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
      label: t('detail.first_trigger_time'),
      key: 'first_trigger_time',
      render(time) {
        return moment(time * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      label: t('detail.last_eval_time'),
      key: 'last_eval_time',
      render(time) {
        return moment(time * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      label:
        eventDetail?.is_recovered && eventDetail?.cate === 'prometheus' && (eventDetail?.rule_config?.version === 'v1' || eventDetail?.rule_config?.version === undefined)
          ? t('detail.trigger_value')
          : t('detail.trigger_value2'),
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
    {
      label: t('detail.cate'),
      key: 'cate',
    },
    ...(_.includes(['firemap', 'northstar'], eventDetail?.rule_prod)
      ? [
          {
            label: t(`detail.${eventDetail?.rule_prod}_ql_label`),
            key: 'prom_ql',
            render: (val) => {
              return val;
            },
          },
        ]
      : [false]),
    ...(eventDetail?.cate === 'prometheus' && !_.includes(['firemap', 'northstar'], eventDetail?.rule_prod)
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
    ...(eventDetail?.cate === 'tdengine' ? TDengineDetail(t) : [false]),
    ...(eventDetail?.cate === 'elasticsearch' ? ElasticsearchDetail({ indexPatterns }) : [false]),
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
        return _.join(channels, ' ');
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

  return (
    <div className='event-detail-container'>
      <Spin spinning={!eventDetail}>
        <div className='desc-container'>
          {eventDetail && (
            <div>
              {showGraph && <PlusPreview data={eventDetail} />}
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
              <EventNotifyRecords eventId={eventDetail.id} />
              <TaskTpls eventDetail={eventDetail} />
            </div>
          )}
        </div>
      </Spin>
    </div>
  );
}
