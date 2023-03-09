import React from 'react';
import { Row, Col, Button } from 'antd';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import './index.less';

interface Props {
  sourceMap: any;
  urlPrefix?: string;
}

export default function SourceCard(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { sourceMap, urlPrefix = 'settings' } = props;
  return (
    <Row className='settings-datasource' gutter={[16, 16]}>
      {_.map(sourceMap, (item) => {
        return (
          <Col span={6} key={item.name}>
            <Link to={`/${urlPrefix}/add/${item.type.includes('.') ? _.toLower(item.type).split('.')[0] : _.toLower(item.type)}`}>
              <div className='settings-datasource-item'>
                <div className='settings-datasource-item-meta'>
                  <div style={{ height: '45px', lineHeight: '45px' }}>{item.name !== '自定义事件' && item.logo}</div>
                  <div className='settings-datasource-item-name' style={{ height: 20, margin: '8px 0' }}>
                    {item.name}
                  </div>
                </div>
                <div>
                  <Button size='small' type='primary' ghost style={{ borderRadius: 4 }}>
                    {t('type_btn_add')}
                  </Button>
                </div>
              </div>
            </Link>
          </Col>
        );
      })}
    </Row>
  );
}
