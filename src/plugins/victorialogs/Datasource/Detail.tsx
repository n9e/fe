import React from 'react';
import { Row, Col } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';

interface Props {
  data: any;
}
export default function Index(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { data } = props;
  const cate = DatasourceCateEnum.victorialogs;

  return (
    <div>
      <div className='page-title'>HTTP</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={24}>URL：</Col>
          <Col span={24} className='second-color'>
            {_.get(data, ['settings', `${cate}.addr`], '-')}
          </Col>
        </Row>
      </div>
      <div className='page-title'>{t('form.auth')}</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={8}>{t('form.username')}：</Col>
          <Col span={8}>{t('form.password')}：</Col>
          <Col span={8}>{t('form.skip_tls_verify')}：</Col>
          <Col span={8} className='second-color'>
            {_.get(data, ['settings', `${cate}.basic`, `${cate}.user`], '-')}
          </Col>
          <Col span={8} className='second-color'>
            {_.get(data, ['settings', `${cate}.basic`, `${cate}.password`]) ? '******' : '-'}
          </Col>
          <Col span={8} className='second-color'>
            {_.get(data, ['settings', `${cate}.tls`, `${cate}.tls.skip_tls_verify`]) ? t('form.yes') : t('form.no')}
          </Col>
        </Row>
      </div>
      {!_.isEmpty(_.get(data, ['settings', `${cate}.headers`])) && (
        <>
          <div className='page-title'>{t('form.headers')}</div>
          <div className='flash-cat-block'>
            <Row gutter={16}>
              {_.map(_.get(data, ['settings', `${cate}.headers`]), (val, key) => {
                return (
                  <Col key={key} span={24}>
                    {key + ' : ' + val}
                  </Col>
                );
              })}
            </Row>
          </div>
        </>
      )}
      <div className='flash-cat-block' style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={24}>{t('form.cluster')}：</Col>
          <Col span={24} className='second-color'>
            {_.get(data, ['settings', `${cate}.cluster_name`], '-')}
          </Col>
        </Row>
      </div>
    </div>
  );
}
