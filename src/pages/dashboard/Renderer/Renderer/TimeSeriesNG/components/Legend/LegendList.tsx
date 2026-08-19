import React, { useMemo } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { IPanel } from '../../../../../types';
import { DataItem } from '../../utils/getLegendData';

import Link from './Link';

interface Props {
  panel: IPanel;
  data: DataItem[];
  legendColumns?: string[];
  legendSortBy?: string;
  legendSortDir?: string;
  placement?: 'bottom' | 'right';
  onRowClick: (record: DataItem) => void;
}

export default function LegendList(props: Props) {
  const { t } = useTranslation('dashboard');
  const { panel, data, legendColumns, legendSortBy, legendSortDir, placement, onRowClick } = props;
  const options = panel.options || {};
  const detailName = options.legend?.detailName;
  const detailUrl = options.legend?.detailUrl;

  const sortedData = useMemo(() => {
    if (!legendSortBy) return data;
    const dir = legendSortDir === 'desc' ? 'desc' : 'asc';
    return _.orderBy(data, [(item) => item[legendSortBy]?.stat], [dir]);
  }, [data, legendSortBy, legendSortDir]);

  return (
    <div
      style={{
        minWidth: 0,
        height: '100%',
        overflow: 'auto',
      }}
    >
      <ul className='renderer-timeseries-ng-legend-list'>
        {_.map(sortedData, (item) => {
          return (
            <li
              key={item.id}
              style={{
                display: placement === 'right' ? 'block' : 'inline-block',
              }}
            >
              <div
                className={classNames('renderer-timeseries-ng-legend-list-item', {
                  disabled: !item.show,
                })}
                onClick={() => {
                  onRowClick(item);
                }}
              >
                <div className='renderer-timeseries-ng-legend-color-symbol' style={{ backgroundColor: item.color }} />
                <div className='renderer-timeseries-ng-legend-table-name-content'>
                  {item.offset && item.offset !== 'current' ? <span style={{ paddingRight: 5 }}>offfset {item.offset}</span> : ''}
                  <span>{item.name}</span>
                </div>
                <Link data={item} name={detailName} url={detailUrl} />
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
