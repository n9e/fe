import React from 'react';
import { Row, Col } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import AdvancedWrap from '@/components/AdvancedWrap';

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
            {data?.http?.url}
          </Col>
        </Row>
      </div>
      <div className='page-title'>{t('form.auth')}</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={8}>{t('form.username')}：</Col>
          <Col span={8}>{t('form.password')}：</Col>
          <Col span={8}>{t('form.skip_ssl_verify')}：</Col>
          <Col span={8} className='second-color'>
            {data?.auth?.basic_auth_user || '-'}
          </Col>
          <Col span={8} className='second-color'>
            {data?.auth?.basic_auth_password ? '******' : '-'}
          </Col>
          <Col span={8} className='second-color'>
            {data.http?.tls?.skip_tls_verify ? t('form.yes') : t('form.no')}
          </Col>
        </Row>
      </div>
      {!_.isEmpty(data?.http?.headers) && (
        <>
          <div className='page-title'>{t('form.headers')}</div>
          <div className='flash-cat-block'>
            <Row gutter={16}>
              {_.map(data?.http?.headers, (val, key) => {
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
      <div className='page-title'>{t('form.other')}</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={8}>{t('form.es.version')}：</Col>
          <Col span={8}>{t('form.es.max_shard')}：</Col>
          <Col span={8}>{t('form.es.min_interval')}：</Col>
          <Col span={8} className='second-color'>
            {data.settings?.version || '-'}
          </Col>
          <Col span={8} className='second-color'>
            {data.settings?.max_shard || '-'}
          </Col>
          <Col span={8} className='second-color'>
            {data.settings?.min_interval || '-'}
          </Col>
        </Row>
        <AdvancedWrap var='VITE_IS_PRO,VITE_IS_ENT'>
          <Row gutter={16}>
            <Col span={24}>{t('form.cluster')}：</Col>
            <Col span={24} className='second-color'>
              {data?.cluster_name || '-'}
            </Col>
          </Row>
        </AdvancedWrap>
      </div>
    </div>
  );
}
