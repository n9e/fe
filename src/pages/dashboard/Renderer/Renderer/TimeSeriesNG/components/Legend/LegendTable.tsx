import React from 'react';
import { Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { IRawTimeRange } from '@/components/TimeRangePicker';

import { IPanel } from '../../../../../types';
import { DataItem } from '../../utils/getLegendData';
import NameWithTooltip from '../NameWithTooltip';

import Link from './Link';

interface Props {
  panel: IPanel;
  range?: IRawTimeRange;
  data: DataItem[];
  legendColumns?: string[];
  onRowClick: (record: DataItem) => void;
}

export default function LegendTable(props: Props) {
  const { t } = useTranslation('dashboard');
  const { panel, range, data, legendColumns, onRowClick } = props;
  const options = panel.options || {};
  const detailName = options.legend?.detailName;
  const detailUrl = options.legend?.detailUrl;

  let columns: ColumnProps<DataItem>[] = [
    {
      title: `Series (${data.length})`,
      dataIndex: 'name',
      width: '100%',
      render: (text, record: any) => {
        return (
          <div className='renderer-timeseries-ng-legend-table-name-column'>
            <div className='renderer-timeseries-ng-legend-color-symbol' style={{ backgroundColor: record.color }} />
            <NameWithTooltip record={record}>
              <div className='renderer-timeseries-ng-legend-table-name-content'>
                {record.offset && record.offset !== 'current' ? <span style={{ paddingRight: 4 }}>offfset {record.offset}</span> : ''}
                <span>{text}</span>
              </div>
            </NameWithTooltip>
            <Link data={record} range={range} name={detailName} url={detailUrl} />
          </div>
        );
      },
    },
  ];
  _.forEach(legendColumns, (column) => {
    columns = [
      ...columns,
      {
        title: t(`panel.options.legend.${column}`, {
          lng: 'en_US', // fixed to en_US, optimize column width
        }),
        dataIndex: column,
        sorter: (a, b) => a[column].stat - b[column].stat,
        render: (text) => {
          return text.text;
        },
      },
    ];
  });

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
      }}
    >
      <Table
        className='mt1 renderer-timeseries-ng-legend-table'
        size='small'
        pagination={false}
        rowKey='id'
        columns={columns}
        dataSource={data}
        rowClassName={(record) => {
          return !record.show ? 'renderer-timeseries-ng-legend-table-row disabled' : 'renderer-timeseries-ng-legend-table-row';
        }}
        onRow={(record) => {
          return {
            onClick: () => {
              onRowClick(record);
            },
          };
        }}
      />
    </div>
  );
}
