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
