import React from 'react';
import _ from 'lodash';
import { Row, Col, Button, Space } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import queryString from 'query-string';
import moment from 'moment';
import PromQLInput from '@/components/PromQLInput';

interface IProps {
  eventDetail: any;
  history: any;
}

export default function PrometheusDetail(props: IProps) {
  const { eventDetail, history } = props;

  return [
    {
      label: 'PromQL',
      key: 'rule_config',
      render(ruleConfig) {
        const queries = _.get(ruleConfig, 'queries', []);
        return (
          <div style={{ width: '100%' }}>
            {_.map(queries, () => {
              const prom_ql = eventDetail.prom_ql;
              return (
                <Space align='baseline' size={2}>
                  <Button
                    className='p0'
                    style={{
                      position: 'relative',
                      top: 1,
                    }}
                    type='link'
                    onClick={() => {
                      history.push({
                        pathname: '/metric/explorer',
                        search: queryString.stringify({
                          prom_ql,
                          data_source_name: 'prometheus',
                          data_source_id: eventDetail.datasource_id,
                          mode: 'graph',
                          start: moment.unix(eventDetail.trigger_time).subtract(30, 'minutes').unix(),
                          end: moment.unix(eventDetail.trigger_time).add(30, 'minutes').unix(),
                        }),
                      });
                    }}
                  >
                    <PlayCircleOutlined />
                  </Button>
                  <PromQLInput value={prom_ql} readonly />
                </Space>
              );
            })}
          </div>
        );
      },
    },
  ];
}
