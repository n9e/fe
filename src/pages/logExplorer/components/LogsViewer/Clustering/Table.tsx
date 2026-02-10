import { Space } from 'antd';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NAME_SPACE } from '../../../constants';
import { OptionsType } from '../types';
import RDGTable from '../components/Table';

interface Props {
  options?: OptionsType;
  clusteringOptionsEleRef: React.RefObject<HTMLDivElement>;
  logs: { [index: string]: string }[];
  logsHash?: string;
  setPatternHistogramState: React.Dispatch<React.SetStateAction<{ visible: boolean }>>;
}

export default function TableCpt(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { options, clusteringOptionsEleRef, logs, logsHash, setPatternHistogramState } = props;

  const id_key = 'id'; // 数据唯一标识字段
  const [data, setData] = React.useState<{ [index: string]: any }[]>([]); // 聚类表格数据

  console.log('TableCpt render', { logs, logsHash });

  const getColumns = () => {
    const columns: any[] = [
      {
        key: 'count',
        name: 'Count',
      },
      {
        key: 'parts',
        name: '日志数据',
        formatter: () => {
          return <div>日志数据</div>;
        },
      },
    ];
    if (options?.lines === 'true') {
      columns.unshift({
        name: t('logs.settings.lines'),
        key: '___lines___',
        width: 40,
        resizable: false,
        formatter: ({ row }) => {
          const idx = _.findIndex(data, { [id_key]: row[id_key] });
          return idx + 1;
        },
      });
    }
    return columns;
  };

  return (
    <div className='min-h-0 h-full'>
      {clusteringOptionsEleRef.current && createPortal(<Space>目前对当前页的字段 message 聚合</Space>, clusteringOptionsEleRef.current)}
      <RDGTable
        className='n9e-event-logs-table'
        rowKeyGetter={(row) => {
          return row[id_key];
        }}
        columns={getColumns()}
        rows={data}
      />
    </div>
  );
}
