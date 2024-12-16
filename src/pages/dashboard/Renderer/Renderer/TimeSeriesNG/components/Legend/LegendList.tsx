import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { DataItem } from '../../utils/getLegendData';

interface Props {
  data: DataItem[];
  legendColumns?: string[];
  placement?: 'bottom' | 'right';
}

export default function LegendList(props: Props) {
  const { t } = useTranslation('dashboard');
  const { data, legendColumns, placement } = props;

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
      }}
    >
      <ul className='renderer-timeseries-ng-legend-list '>
        {_.map(data, (item) => {
          return (
            <li
              key={item.name}
              style={{
                display: placement === 'right' ? 'block' : 'inline-block',
              }}
            >
              <div className='renderer-timeseries-ng-legend-table-name-column'>
                <div className='renderer-timeseries-ng-legend-color-symbol' style={{ backgroundColor: item.color }} />
                <div className='renderer-timeseries-ng-legend-table-name-content'>
                  {item.offset && item.offset !== 'current' ? <span style={{ paddingRight: 5 }}>offfset {item.offset}</span> : ''}
                  <span>{item.name}</span>
                </div>
                <div className='renderer-timeseries-ng-legend-list-stat'>
                  {_.map(legendColumns, (column) => {
                    return (
                      <span key={column} style={{ paddingLeft: 8 }}>
                        {t(`panel.options.legend.${column}`, {
                          lng: 'en_US', // fixed to en_US, optimize column width
                        })}
                        : {item[column].text}
                      </span>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
