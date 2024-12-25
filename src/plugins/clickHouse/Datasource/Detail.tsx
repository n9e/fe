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
      <div className='page-title'>HTTP</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          {_.map(data?.settings?.['ck.nodes'], (el, index) => (
            <Fragment key={index}>
              <Col span={4}>URL：</Col>
              <Col span={20} className='second-color'>
                {el}
              </Col>
            </Fragment>
          ))}
        </Row>
      </div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={8}>{t('form.username')}：</Col>
          <Col span={8}>{t('form.password')}：</Col>
          <Col span={8}>{t('form.timeout')}：</Col>
          <Col span={8} className='second-color'>
            {data?.settings?.[`${type}.user`]}
          </Col>
          <Col span={8} className='second-color'>
            {data?.settings?.[`${type}.password`] ? '******' : '-'}
          </Col>
          <Col span={8} className='second-color'>
            {data.settings?.['ck.timeout']}
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
