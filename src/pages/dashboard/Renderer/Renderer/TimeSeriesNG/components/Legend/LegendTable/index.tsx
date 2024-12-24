import React from 'react';
import { Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { DataItem } from '../../../utils/getLegendData';
import NameWithTooltip from '../../NameWithTooltip';

interface Props {
  data: DataItem[];
  legendColumns?: string[];
  onRowClick: (record: DataItem) => void;
}

export default function LegendTable(props: Props) {
  const { t } = useTranslation('dashboard');
  const { data, legendColumns, onRowClick } = props;

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
                {record.offset && record.offset !== 'current' ? <span style={{ paddingRight: 5 }}>offfset {record.offset}</span> : ''}
                <span>{text}</span>
              </div>
            </NameWithTooltip>
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
