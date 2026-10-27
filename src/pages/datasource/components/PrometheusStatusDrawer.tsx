import React from 'react';
import { Drawer } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  name?: string;
  statusUrl?: string;
  onClose: () => void;
}

export default function PrometheusStatusDrawer(props: Props) {
  const { visible, name, statusUrl, onClose } = props;
  const { t } = useTranslation('datasourceManage');
  const title = name ? `${name} ${t('prom_status_link')}` : t('prom_status_link');

  return (
    <Drawer
      width='80%'
      title={title}
      placement='right'
      visible={visible}
      destroyOnClose
      onClose={onClose}
      className='n9e-antd-drawer'
      bodyStyle={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      extra={
        statusUrl ? (
          <a href={statusUrl} target='_blank' rel='noopener noreferrer'>
            {t('prom_status_open')}
          </a>
        ) : null
      }
    >
      {statusUrl ? <iframe title={title} src={statusUrl} className='min-h-0 w-full flex-1 border-0' /> : null}
    </Drawer>
  );
}
