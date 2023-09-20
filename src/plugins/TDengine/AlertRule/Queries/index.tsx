import React from 'react';
import { Form, Space, Input, Row, Col, Card, Button } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { RelativeTimeRangePicker } from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import AdvancedSettings from '@/plugins/TDengine/components/AdvancedSettings';
import GraphPreview from './GraphPreview';
import SqlTemplates from '../../components/SqlTemplates';
import { MetaModal } from '../../components/Meta';
import './style.less';

interface IProps {
  form: any;
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: string[]; // 列表字段名
  disabled?: boolean;
  datasourceValue: number | number[];
}

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export default function index({ form, prefixField = {}, fullPrefixName = [], prefixName = [], disabled, datasourceValue }: IProps) {
  const { t } = useTranslation('db_tdengine');
  const datasourceID = _.isArray(datasourceValue) ? datasourceValue[0] : datasourceValue;

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
                  <Row gutter={8}>
                    <Col flex='32px'>
                      <Form.Item>
                        <Input readOnly style={{ width: 32 }} value={alphabet[index]} />
                      </Form.Item>
                    </Col>
                    <Col flex='auto'>
                      <div className='tdengine-discover-query'>
                        <InputGroupWithFormItem label='查询条件'>
                          <Form.Item {...field} name={[field.name, 'query', 'query']}>
                            <Input />
                          </Form.Item>
                        </InputGroupWithFormItem>
                        <Form.Item {...field} name={[field.name, 'query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
                          <RelativeTimeRangePicker />
                        </Form.Item>
                        <SqlTemplates
                          onSelect={(sql) => {
                            form.setFieldsValue({
                              query: _.set(form.getFieldValue([...prefixName, 'queries', field.name, 'query']), 'query', sql),
                            });
                          }}
                        />
                        <MetaModal datasourceValue={datasourceID} />
                      </div>
                    </Col>
                  </Row>
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
                      const query = getFieldValue([...fullPrefixName, ...prefixName, 'queries', field.name]);

                      return <GraphPreview cate={cate} datasourceValue={datasourceID} query={query} />;
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
