import React from 'react';
import _ from 'lodash';

export default function EventDetail(t) {
  return [
    {
      label: t('db_tdengine:query.query'),
      key: 'rule_config',
      render(val) {
        const queries = _.get(val, 'queries', []);
        return (
          <div>
            {_.map(queries, (item) => {
              return (
                <div key={item.ref}>
                  ${item.ref}: {item.query}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      label: t('db_tdengine:trigger.title'),
      key: 'rule_config',
      render(val) {
        const triggers = _.get(val, 'triggers', []);
        const trigger = _.get(triggers, '[0]');
        return `${trigger?.exp} ${t('AlertCurEvents:detail.trigger')} ${t(`common:severity.${trigger?.severity}`)}`;
      },
    },
  ];
}
