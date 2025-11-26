import React, { Fragment } from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

interface Props {
  data: any;
  type: string;
}
export default function MysqlLike(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { data, type } = props;

  return (
    <div>
      <div className='page-title'>{t('endpoint_title')}</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={4}>{t('form.protocol')}：</Col>
          <Col span={20} className='second-color'>
            {data?.settings?.[`${type}.protocol`] || '-'}
          </Col>
          {_.map(data?.settings?.[`${type}.nodes`], (el, index) => (
            <Fragment key={index}>
              <Col span={4}>URL：</Col>
              <Col span={20} className='second-color'>
                {el}
              </Col>
            </Fragment>
          ))}
        </Row>
      </div>
      <div className='page-title'>{t('form.auth')}</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={12}>{t('form.secure_connection')}：</Col>
          <Col span={12}>{t('form.skip_ssl_verify')}：</Col>
          <Col span={12} className='second-color'>
            {data?.settings?.[`${type}.secure_connection`] ? t('common:yes') : t('common:no')}
          </Col>
          <Col span={12} className='second-color'>
            {data?.settings?.[`${type}.skip_ssl_verify`] ? t('common:yes') : t('common:no')}
          </Col>
          <Col span={12}>{t('form.username')}：</Col>
          <Col span={12}>{t('form.password')}：</Col>
          <Col span={12} className='second-color'>
            {data?.settings?.[`${type}.user`]}
          </Col>
          <Col span={12} className='second-color'>
            {data?.settings?.[`${type}.password`] ? '******' : '-'}
          </Col>
        </Row>
      </div>
      <div className='page-title'>{t('common:advanced_settings')}</div>
      <div className='flash-cat-block'>
        <Col span={24}>{t('datasource:datasource.timeout_ms')}</Col>
        <Col span={24} className='second-color'>
          {data.settings[`${type}.timeout`] || '-'}
        </Col>
        <Col span={24}>{t('datasource:datasource.max_query_rows')}</Col>
        <Col span={24} className='second-color'>
          {data.settings[`${type}.max_query_rows`] || '-'}
        </Col>
        <Col span={24}>{t('datasource:datasource.max_idle_conns')}</Col>
        <Col span={24} className='second-color'>
          {data.settings[`${type}.max_idle_conns`] || '-'}
        </Col>
        <Col span={24}>{t('datasource:datasource.max_open_conns')}</Col>
        <Col span={24} className='second-color'>
          {data.settings[`${type}.max_open_conns`] || '-'}
        </Col>
        <Col span={24}>{t('datasource:datasource.conn_max_lifetime')}</Col>
        <Col span={24} className='second-color'>
          {data.settings[`${type}.conn_max_lifetime`] || '-'}
        </Col>
      </div>
      <div className='page-title'>{t('form.other')}</div>
      <div className='flash-cat-block'>
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
