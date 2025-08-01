import React from 'react';
import { Form, Row, Col, Switch } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { Panel } from '../../Components/Collapse';
import CellOptions from './CellOptions';

export default function GraphStyles({ chartForm, variableConfigWithOptions }) {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['custom'];

  return (
    <Panel header={t('panel.custom.title')}>
      <>
        <Row gutter={10}>
          <Col span={24}>
            <Form.Item label={t('panel.custom.table.showHeader')} name={[...namePrefix, 'showHeader']} valuePropName='checked' initialValue={true}>
              <Switch />
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item label={t('panel.custom.tableNG.enablePagination')} name={[...namePrefix, 'enablePagination']} valuePropName='checked'>
              <Switch size='small' />
            </Form.Item>
          </Col> */}
        </Row>
        <CellOptions namePath={['custom', 'cellOptions']} />
      </>
    </Panel>
  );
}
