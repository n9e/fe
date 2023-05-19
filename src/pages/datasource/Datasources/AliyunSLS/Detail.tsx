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
      <div className='page-title'>{t('form.sls.title')}</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={24}>{t('form.sls.endpoint')}：</Col>
          <Col span={24} className='second-color'>
            {data.settings['sls.endpoint']}
          </Col>
        </Row>
      </div>
      <div className='page-title'>{t('form.sls.access')}</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={12}>AccessKey ID：</Col>
          <Col span={12}>AccessKey Secret：</Col>
          <Col span={12} className='second-color'>
            {data.settings['sls.access_key_id'] ? data.settings['sls.access_key_id'] : '-'}
          </Col>
          <Col span={12} className='second-color'>
            {data.settings['sls.access_key_secret'] ? data.settings['sls.access_key_secret'] : '-'}
          </Col>
        </Row>
      </div>
      <div className='flash-cat-block' style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={24}>{t('form.cluster')}：</Col>
          <Col span={24} className='second-color'>
            {data?.cluster_name || '-'}
          </Col>
        </Row>
      </div>
    </div>
  );
}
