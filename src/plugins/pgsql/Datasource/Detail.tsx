import React from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '../constants';
import { DataSourceType } from './types';

interface Props {
  data: DataSourceType;
}
export default function MysqlLike(props: Props) {
  const { t } = useTranslation();
  const { data } = props;
  const obj: {
    string?: string;
  } = {};
  const type = NAME_SPACE;

  data.settings[`${type}.tables`] &&
    data.settings[`${type}.tables`].forEach((item) => {
      if (!item || !item[`${type}.table.source`] || !item[`${type}.table.target`]) return;

      if (obj[item[`${type}.table.target`]]) {
        obj[item[`${type}.table.target`]] += ' + ' + item[`${type}.table.source`] + ` ( ${item[`${type}.table.op`] === 'EQ' ? t('精确') : t('正则')} ) `;
      } else {
        obj[item[`${type}.table.target`]] = item[`${type}.table.source`] + ` ( ${item[`${type}.table.op`] === 'EQ' ? t('精确') : t('正则')} ) `;
      }
    });

  return (
    <div>
      <div className='page-title'>{t(`${NAME_SPACE}:datasource.shards.title`)}</div>
      <div className='flash-cat-block'>
        {data.settings[`${type}.shards`].map((item, i) => (
          <div className='flash-cat-block' key={i}>
            <Row gutter={16}>
              <Col span={12}>{t(`${NAME_SPACE}:datasource.shards.addr`)}</Col>
              <Col span={12}>{t(`${NAME_SPACE}:datasource.shards.user`)}</Col>
              <Col span={12} className='second-color'>
                {item[`${type}.addr`]}
              </Col>
              <Col span={12} className='second-color'>
                {item[`${type}.user`]}
              </Col>
            </Row>
          </div>
        ))}
      </div>
      <div className='page-title'>{t('datasourceManage:form.other')}</div>
      <div className='flash-cat-block'>
        <Row gutter={16}>
          <Col span={24}>{t('datasourceManage:form.cluster')}</Col>
          <Col span={24} className='second-color'>
            {data.settings[`${type}.cluster_name`] || '-'}
          </Col>
        </Row>
      </div>
    </div>
  );
}
