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
          <Col span={4} key={item.name}>
            <Link to={`/${urlPrefix}/add/${item.type.includes('.') ? _.toLower(item.type).split('.')[0] : _.toLower(item.type)}`}>
              <div className='builtin-cates-grid-item'>
                <img src={item.logo} width={48} height={48} alt={item.name} />
                <div>{item.name}</div>
              </div>
            </Link>
          </Col>
        );
      })}
    </Row>
  );
}
