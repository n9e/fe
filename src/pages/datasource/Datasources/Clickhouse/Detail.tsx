import React from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  data: any;
  type: string;
}
export default function MysqlLike(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { data, type } = props;

  return (
    <div>
      <div className='page-title'>{t('form.ck.title')}</div>
      <div className='flash-cat-block'>
        {data.settings[`${type}.shards`].map((item, i) => (
          <div className='flash-cat-block' key={i}>
            <Row gutter={16}>
              <Col span={8}>{t('form.ck.addr')}：</Col>
              <Col span={8}>{t('form.username')}：</Col>
              <Col span={8}>{t('form.password')}：</Col>
              <Col span={8} className='second-color'>
                {item[`${type}.addr`]}
              </Col>
              <Col span={8} className='second-color'>
                {item[`${type}.user`]}
              </Col>
              <Col span={8} className='second-color'>
                {item[`${type}.password`] ? '******' : '-'}
              </Col>
            </Row>
          </div>
        ))}
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
