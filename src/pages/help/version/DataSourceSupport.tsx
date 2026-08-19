import React from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

import { allDatasourceCategories, getDatasourceCategoryDisplayLabel } from '@/utils/datasourceRegistry';
import { IS_PLUS } from '@/utils/constant';

interface DatasourceSupportRow {
  key: string;
  label: string;
  label_en?: string;
  logo?: string;
  explorer: boolean;
  alert: boolean;
  dashboard: boolean;
}

const supportedCates: DatasourceSupportRow[] = allDatasourceCategories
  .filter((cate) => cate.type.includes('metric') || cate.type.includes('logging'))
  .map((cate) => ({
    key: cate.value,
    label: cate.label,
    label_en: cate.label_en,
    logo: cate.logo,
    explorer: IS_PLUS || !cate.graphPro,
    alert: cate.alertRule && (IS_PLUS || !cate.alertPro),
    dashboard: cate.dashboard && (IS_PLUS || !cate.graphPro),
  }));

function SupportedIcon({ supported }: { supported: boolean }) {
  if (!supported) return null;

  return <CheckOutlined className='text-primary text-base' />;
}

export default function DataSourceSupport() {
  const { t, i18n } = useTranslation('version');
  const columns: ColumnsType<DatasourceSupportRow> = [
    {
      title: t('datasource'),
      dataIndex: 'label',
      render: (_, cate) => (
        <div className='flex items-center gap-2'>
          {cate.logo && <img src={cate.logo} alt='' className='w-5 h-5 object-contain' />}
          <span>{getDatasourceCategoryDisplayLabel(cate, i18n.language)}</span>
        </div>
      ),
    },
    {
      title: t('instant_query'),
      dataIndex: 'explorer',
      align: 'center',
      render: (supported) => <SupportedIcon supported={supported} />,
    },
    {
      title: t('alert'),
      dataIndex: 'alert',
      align: 'center',
      render: (supported) => <SupportedIcon supported={supported} />,
    },
    {
      title: t('dashboard'),
      dataIndex: 'dashboard',
      align: 'center',
      render: (supported) => <SupportedIcon supported={supported} />,
    },
  ];

  return (
    <Card className='mt-4' title={t('datasource_support')} size='small'>
      <Table columns={columns} dataSource={supportedCates} pagination={false} size='small' />
    </Card>
  );
}
