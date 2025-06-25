import React, { useState } from 'react';
import { Button, Row, Col } from 'antd';
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
      <div className='page-title'>FE node</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={24}>URL：</Col>
          <Col span={24} className='second-color'>
            {data.settings['doris.addr']}
          </Col>
        </Row>
      </div>
      <div className='page-title'>{t('form.auth')}</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={12}>{t('form.username')}：</Col>
          <Col span={12}>{t('form.password')}：</Col>
          <Col span={12} className='second-color'>
            {data.settings ? data.settings['doris.user'] : '-'}
          </Col>
          <Col span={12} className='second-color'>
            {data.settings ? '******' : '-'}
          </Col>
        </Row>
      </div>
      <div className='page-title'>{t('form.other')}</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={24}>{t('datasourceManage:form.cluster')}：</Col>
          <Col span={24} className='second-color'>
            {data.settings[`doris.cluster_name`] || '-'}
          </Col>
        </Row>
      </div>
    </div>
  );
}
