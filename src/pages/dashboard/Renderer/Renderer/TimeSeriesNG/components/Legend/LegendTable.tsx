import React from 'react';
import { Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { IPanel } from '../../../../../types';
import { DataItem } from '../../utils/getLegendData';
import NameWithTooltip from '../NameWithTooltip';

import Link from './Link';

interface Props {
  panel: IPanel;
  data: DataItem[];
  legendColumns?: string[];
  onRowClick: (record: DataItem) => void;
}

export default function LegendTable(props: Props) {
  const { t } = useTranslation('dashboard');
  const { panel, data, legendColumns, onRowClick } = props;
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
          <div className='w-full flex items-center gap-2 whitespace-nowrap'>
            <div className='w-[14px] h-[4px] rounded-[10px] inline-block flex-shrink-0' style={{ backgroundColor: record.color }} />
            <NameWithTooltip record={record}>
              <div className='whitespace-nowrap bg-transparent border-0 text-inherit padding-0 max-w-[600px] text-ellipsis overflow-hidden select-text'>
                {record.offset && record.offset !== 'current' ? <span style={{ paddingRight: 4 }}>offfset {record.offset}</span> : ''}
                <span>{text}</span>
              </div>
            </NameWithTooltip>
            <Link data={record} name={detailName} url={detailUrl} />
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
    <div className='min-w-0 h-full overflow-auto'>
      <Table
        className='mt-2 renderer-timeseries-ng-legend-table'
        size='small'
        pagination={false}
        rowKey='id'
        columns={columns}
        dataSource={data}
        rowClassName={(record) => {
          return !record.show ? 'cursor-pointer text-soft' : 'cursor-pointer';
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
