import React from 'react';
import { Form, Row, Col, Switch, Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { useGlobalState } from '../../../globalState';
import { Panel } from '../../Components/Collapse';
import CellOptions from './CellOptions';

export default function GraphStyles({ chartForm, variableConfigWithOptions }) {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const [tableFields] = useGlobalState('tableFields');

  return (
    <Panel header={t('panel.custom.title')}>
      <>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label={t('panel.custom.tableNG.showHeader')} name={[...namePrefix, 'showHeader']} valuePropName='checked' initialValue={true}>
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.tableNG.filterable')} name={[...namePrefix, 'filterable']} valuePropName='checked' initialValue={false}>
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.tableNG.sortColumn')} name={[...namePrefix, 'sortColumn']}>
              <Select
                allowClear
                options={_.map(tableFields, (item) => {
                  return { label: item, value: item };
                })}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.tableNG.sortOrder')} name={[...namePrefix, 'sortOrder']}>
              <Select allowClear>
                <Select.Option value='ascend'>Asc</Select.Option>
                <Select.Option value='descend'>Desc</Select.Option>
              </Select>
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
