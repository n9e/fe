import React from 'react';
import _ from 'lodash';
import i18next from 'i18next';

export default function ElasticsearchDetail() {
  return [
    {
      label: i18next.t('datasource:es.value'),
      key: 'rule_config',
      render(val) {
        const queries = _.get(val, 'queries', []);
        return _.map(queries, (item) => {
          return (
            <div key={item.ref}>
              <span className='pr16'>
                {i18next.t('datasource:es.ref')}: {item.ref}
              </span>
              <span className='pr16'>
                {i18next.t('datasource:es.index')}: {item.index}
              </span>
              {item.query && (
                <span className='pr16'>
                  {i18next.t('datasource:es.filter')}: {item.query}
                </span>
              )}
              <span className='pr16'>
                {i18next.t('datasource:es.date_field')}: {item.date_field}
              </span>
              <span className='pr16'>
                {i18next.t('datasource:es.interval')}: {item.interval}
                {item.interval_unit}
              </span>
              <span className='pr16'>
                {i18next.t('datasource:es.func')}: {item.value?.func}
              </span>
              {item.value?.func !== 'count' && (
                <span className='pr16'>
                  {i18next.t('datasource:es.funcField')}: {item.value?.field}
                </span>
              )}
              {_.map(item.group_by, (item) => {
                return (
                  <span className='pr16'>
                    {i18next.t('datasource:es.event.groupBy', {
                      field: item.field,
                      size: item.size,
                      min_value: item.min_value,
                    })}
                  </span>
                );
              })}
            </div>
          );
        });
      },
    },
    {
      label: i18next.t('datasource:es.alert.trigger.title'),
      key: 'rule_config',
      render(val) {
        const triggers = _.get(val, 'triggers', []);
        return _.map(triggers, (item, idx) => {
          return (
            <div key={idx} className='n9e-fill-color-3' style={{ padding: 8 }}>
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
