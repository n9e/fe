import React from 'react';
import _ from 'lodash';
import i18next from 'i18next';
import { NAME_SPACE } from '../constants';

export default function EventDetail() {
  return [
    {
      label: i18next.t(`${NAME_SPACE}:query.query`),
      key: 'rule_config',
      render(val) {
        const queries = _.get(val, 'queries', []);
        return (
          <div>
            {_.map(queries, (item) => {
              return (
                <div key={item.ref}>
                  ${item.ref}: {item.sql}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      label: i18next.t(`${NAME_SPACE}:trigger.title`),
      key: 'rule_config',
      render(val) {
        const triggers = _.get(val, 'triggers', []);
        const trigger = _.get(triggers, '[0]');
        return `${trigger?.exp} ${i18next.t('AlertCurEvents:detail.trigger')} ${i18next.t(`common:severity.${trigger?.severity}`)}`;
      },
    },
  ];
}
