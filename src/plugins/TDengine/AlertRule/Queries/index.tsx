import React from 'react';
import { Form, Space, Input, Row, Col, Card, Dropdown, Menu, Button } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, DownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { RelativeTimeRangePicker } from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import AdvancedSettings from '@/plugins/TDengine/components/AdvancedSettings';
import GraphPreview from './GraphPreview';
import './style.less';

interface IProps {
  form: any;
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: string[]; // 列表字段名
  disabled?: boolean;
}

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export default function index({ form, prefixField = {}, fullPrefixName = [], prefixName = [], disabled }: IProps) {
  const { t } = useTranslation('db_aliyunSLS');
  return (
    <>
      <Form.List
        {...prefixField}
        name={[...prefixName, 'queries']}
        initialValue={[
          {
            ref: 'A',
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <Card
            title={
              <Space>
                {t('query.title')}
                <PlusCircleOutlined
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    add({
                      ref: alphabet[fields.length],
                    });
                  }}
                />
              </Space>
            }
            size='small'
          >
            {fields.map((field, index) => {
              return (
                <div key={field.key} style={{ backgroundColor: '#fafafa', padding: 16, marginBottom: 16, position: 'relative' }}>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const cate = getFieldValue('cate');
                      const datasourceIDs = getFieldValue('datasource_ids');
                      const datasourceValue = _.isArray(datasourceIDs) ? datasourceIDs?.[0] : datasourceIDs;
                      return (
                        <>
                          <Row gutter={8}>
                            <Col flex='32px'>
                              <Form.Item>
                                <Input readOnly style={{ width: 32 }} value={alphabet[index]} />
                              </Form.Item>
                            </Col>
                            <Col flex='auto'>
                              <div className='tdengine-discover-query'>
                                <InputGroupWithFormItem label='查询条件'>
                                  <Form.Item name={['query', 'query']}>
                                    <Input />
                                  </Form.Item>
                                </InputGroupWithFormItem>
                                <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
                                  <RelativeTimeRangePicker />
                                </Form.Item>
                                <Dropdown
                                  overlay={
                                    <Menu>
                                      <Menu.Item>模板一</Menu.Item>
                                      <Menu.Item>模板二</Menu.Item>
                                    </Menu>
                                  }
                                >
                                  <Button>
                                    查询模板 <DownOutlined />
                                  </Button>
                                </Dropdown>
                                <Button>元信息</Button>
                              </div>
                            </Col>
                          </Row>
                        </>
                      );
                    }}
                  </Form.Item>
                  <AdvancedSettings mode='graph' prefixField={field} prefixName={[field.name]} disabled={disabled} />
                  {fields.length > 1 && (
                    <CloseCircleOutlined
                      style={{ position: 'absolute', right: 16, top: 16 }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  )}
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const cate = getFieldValue('cate');
                      const datasourceIDs = getFieldValue('datasource_ids');
                      const datasourceValue = _.isArray(datasourceIDs) ? datasourceIDs?.[0] : datasourceIDs;
                      const query = getFieldValue([...fullPrefixName, ...prefixName, 'queries', field.name]);

                      return <GraphPreview cate={cate} datasourceValue={datasourceValue} query={query} />;
                    }}
                  </Form.Item>
                </div>
              );
            })}
          </Card>
        )}
      </Form.List>
    </>
  );
}
