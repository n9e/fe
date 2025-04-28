import React from 'react';
import _ from 'lodash';
import i18next from 'i18next';
import { Space, Tag } from 'antd';

export default function ElasticsearchDetail(
  options: {
    indexPatterns: {
      id: number;
      name: string;
    }[];
  } = {
    indexPatterns: [],
  },
) {
  const { indexPatterns } = options;
  return [
    {
      label: i18next.t('datasource:es.value'),
      key: 'rule_config',
      render(val) {
        const queries = _.get(val, 'queries', []);
        return (
          <Space direction='vertical'>
            {_.map(queries, (item) => {
              return (
                <div key={item.ref} className='n9e-fill-color-3 p1 n9e-border-radius-base'>
                  <Space wrap size={0}>
                    <Tag>
                      {i18next.t('datasource:es.ref')}: {item.ref}
                    </Tag>
                    {item.index_type === 'index_pattern' ? (
                      <Tag>
                        {i18next.t('datasource:es.indexPatterns')}: {_.find(indexPatterns, { id: item.index_pattern })?.name ?? item.index_pattern}
                      </Tag>
                    ) : (
                      <Tag>
                        {i18next.t('datasource:es.index')}: {item.index}
                      </Tag>
                    )}
                    {item.query && (
                      <Tag>
                        {i18next.t('datasource:es.filter')}: {item.query}
                      </Tag>
                    )}
                    <Tag>
                      {i18next.t('datasource:es.date_field')}: {item.date_field}
                    </Tag>
                    <Tag>
                      {i18next.t('datasource:es.interval')}: {item.interval}
                      {item.interval_unit}
                    </Tag>
                    <Tag>
                      {i18next.t('datasource:es.func')}: {item.value?.func}
                    </Tag>
                    {item.value?.func !== 'count' && (
                      <Tag>
                        {i18next.t('datasource:es.funcField')}: {item.value?.field}
                      </Tag>
                    )}
                    {_.map(item.group_by, (item) => {
                      return (
                        <Tag>
                          {i18next.t('datasource:es.event.groupBy', {
                            field: item.field,
                            size: item.size,
                            min_value: item.min_value,
                          })}
                        </Tag>
                      );
                    })}
                  </Space>
                </div>
              );
            })}
          </Space>
        );
      },
    },
    {
      label: i18next.t('datasource:es.alert.trigger.title'),
      key: 'rule_config',
      render(val) {
        const trigger_type = _.get(val, 'trigger_type');
        const triggers = _.get(val, 'triggers', []);
        const nodata_trigger = _.get(val, 'nodata_trigger', {});

        if (trigger_type === 'nodata') {
          return (
            <div className='n9e-fill-color-3 p1 n9e-border-radius-base'>
              <span style={{ paddingRight: 4 }}>{i18next.t('alertRules:nodata_trigger.title')}</span>
              <span>
                {i18next.t('AlertCurEvents:detail.trigger')} {`${i18next.t(`common:severity.${nodata_trigger?.severity}`)}`}
              </span>
            </div>
          );
        }

        return _.map(triggers, (item, idx) => {
          return (
            <div key={idx} className='n9e-fill-color-3 p1 n9e-border-radius-base'>
              <span style={{ paddingRight: 4 }}>{item.exp}</span>
              <span>
                {i18next.t('AlertCurEvents:detail.trigger')} {`${i18next.t(`common:severity.${item?.severity}`)}`}
              </span>
            </div>
          );
        });
      },
    },
  ];
}
