import React from 'react';
import { Row, Col } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

interface Props {
  data: any;
}
export default function Index(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { data } = props;

  return (
    <div>
      <div className='page-title'>HTTP</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={24}>URL：</Col>
          <Col span={24} className='second-color'>
            {data?.settings?.['zabbix.addr']}
          </Col>
        </Row>
      </div>
      <div className='page-title'>{t('form.auth')}</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={12}>{t('form.username')}：</Col>
          <Col span={12}>{t('form.password')}：</Col>
          <Col span={12} className='second-color'>
            {data?.settings?.['zabbix.user'] || '-'}
          </Col>
          <Col span={12} className='second-color'>
            {data?.settings?.['zabbix.password'] ? '******' : '-'}
          </Col>
        </Row>
      </div>
      {/* <div className='flash-cat-block' style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={24}>{t('form.cluster')}：</Col>
          <Col span={24} className='second-color'>
            {data?.cluster_name || '-'}
          </Col>
        </Row>
      </div> */}
    </div>
  );
}
