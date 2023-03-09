import React from 'react';
import { Button, Drawer } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Code from '@/components/Code';
import Detail from './Datasources/Detail';
import './index.less';

interface Props {
  data: any;
  visible: boolean;
  onClose: () => void;
}
export default function TimeSeriesDetail(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { data, visible, onClose } = props;

  return (
    <Drawer
      width={584}
      closeIcon={false}
      className='settings-data-source-detail-drawer'
      bodyStyle={{
        padding: '0 15px 15px',
        background: '#fff',
      }}
      title=''
      placement='right'
      onClose={onClose}
      visible={visible}
      footer={
        <Button style={{ float: 'right' }}>
          <Link to={`/help/source/edit/${data.plugin_type}/${data.id}`}>{t('common:btn.edit')}</Link>
        </Button>
      }
    >
      <div>
        <div className='page-title'>{t('name')}</div>
        <div>{data.name}</div>
        <div className='page-title'>{t('id')}</div>
        <Code>{data.id}</Code>
        <Detail data={data} />
        {data.description && (
          <>
            <div className='page-title'>{t('description')}</div>
            <div className='flash-cat-block'>{data.description}</div>
          </>
        )}
      </div>
    </Drawer>
  );
}
