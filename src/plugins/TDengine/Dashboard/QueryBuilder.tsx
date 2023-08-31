import React from 'react';
import { Form, Row, Col, Input, Button, Dropdown, Menu } from 'antd';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import AdvancedSettings from '@/plugins/TDengine/components/AdvancedSettings';
import Collapse, { Panel } from '@/pages/dashboard/Editor/Components/Collapse';
import getFirstUnusedLetter from '@/pages/dashboard/Renderer/utils/getFirstUnusedLetter';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export default function Prometheus({ chartForm, variableConfig, dashboardId }) {
  const { t } = useTranslation('dashboard');

  return (
    <Form.List name='targets'>
      {(fields, { add, remove }, { errors }) => {
        return (
          <>
            <Collapse>
              {_.map(fields, (field, index) => {
                return (
                  <Panel
                    header={
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          return getFieldValue(['targets', field.name, 'refId']) || alphabet[index];
                        }}
                      </Form.Item>
                    }
                    key={field.key}
                    extra={
                      <div>
                        {fields.length > 1 ? (
                          <DeleteOutlined
                            style={{ marginLeft: 10 }}
                            onClick={() => {
                              remove(field.name);
                            }}
                          />
                        ) : null}
                      </div>
                    }
                  >
                    <Form.Item noStyle {...field} name={[field.name, 'refId']}>
                      <div />
                    </Form.Item>
                    <Row gutter={10}>
                      <Col flex='auto'>
                        <Form.Item
                          label='查询条件'
                          {...field}
                          name={[field.name, 'query']}
                          validateTrigger={['onBlur']}
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                          style={{ flex: 1 }}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col flex='92px'>
                        <Dropdown
                          overlay={
                            <Menu>
                              <Menu.Item>模板一</Menu.Item>
                              <Menu.Item>模板二</Menu.Item>
                            </Menu>
                          }
                        >
                          <Button style={{ marginTop: 27 }}>
                            查询模板 <DownOutlined />
                          </Button>
                        </Dropdown>
                      </Col>
                      <Col flex='62px'>
                        <Button style={{ marginTop: 27 }}>元信息</Button>
                      </Col>
                    </Row>

                    <Form.Item
                      label='Legend'
                      {...field}
                      name={[field.name, 'legend']}
                      tooltip={{
                        getPopupContainer: () => document.body,
                        title: 'Controls the name of the time series, using name or pattern. For example {{hostname}} will be replaced with label value for the label hostname.',
                      }}
                    >
                      <Input />
                    </Form.Item>
                    <AdvancedSettings mode='graph' span={8} prefixField={field} prefixName={[field.name]} />
                  </Panel>
                );
              })}

              <Form.ErrorList errors={errors} />
            </Collapse>
            <Button
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => {
                add({ expr: '', refId: getFirstUnusedLetter(_.map(chartForm.getFieldValue('targets'), 'refId')) });
              }}
            >
              + add query
            </Button>
          </>
        );
      }}
    </Form.List>
  );
}
