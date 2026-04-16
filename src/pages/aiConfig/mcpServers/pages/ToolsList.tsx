import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import { Table } from 'antd';

import { NS } from '../constants';
import { getTools } from '../services';

interface Props {
  id: number;
}

export default function ToolsList(props: Props) {
  const { t } = useTranslation(NS);
  const { id } = props;

  const { data } = useRequest(() => getTools(id), {
    refreshDeps: [id],
  });

  return (
    <Table
      className='mt-4'
      size='small'
      rowKey='name'
      dataSource={data}
      columns={[
        {
          dataIndex: 'name',
          title: t('tool.name'),
        },
        {
          dataIndex: 'description',
          title: t('tool.description'),
        },
      ]}
    />
  );
}
