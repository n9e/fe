import React, { useContext } from 'react';
import { Form, Space, Row, Col, Card } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import AdvancedSettings from '../../components/AdvancedSettings';
import QueryName, { generateQueryName } from '@/components/QueryName';
import { CommonStateContext } from '@/App';
import GraphPreview from './GraphPreview';
import DocumentDrawer from '../../components/DocumentDrawer';
import LogQL from '@/components/LogQL';
import { DatasourceCateEnum } from '@/utils/constant';
import { NAME_SPACE } from '../../constants';

interface IProps {
  form: any;
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: string[]; // 列表字段名
  disabled?: boolean;
  datasourceValue: number | number[];
}

export default function index({ form, prefixField = {}, fullPrefixName = [], prefixName = [], disabled, datasourceValue }: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const datasourceID = _.isArray(datasourceValue) ? datasourceValue[0] : datasourceValue;
  const queries = Form.useWatch(['rule_config', 'queries']);

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
                      interval: 1,
                      interval_unit: 'min',
                    });
                  }}
                />
              </Space>
            }
            size='small'
          >
            {fields.map((field, index) => {
              return (
                <div key={field.key} className='n9e-fill-color-3' style={{ padding: 16, marginBottom: 16, position: 'relative' }}>
                  <Row gutter={8}>
                    <Col flex='32px'>
                      <Form.Item {...field} name={[field.name, 'ref']} initialValue={generateQueryName(_.map(queries, 'ref'))}>
                        <QueryName existingNames={_.map(queries, 'ref')} />
                      </Form.Item>
                    </Col>
                    <Col flex='auto'>
                      <div className='tdengine-discover-query'>
                        <InputGroupWithFormItem label={<Space>{t('query.query')}</Space>}>
                          <Form.Item {...field} name={[field.name, 'sql']}>
                            <LogQL
                              datasourceCate={DatasourceCateEnum.ck}
                              datasourceValue={datasourceID}
                              query={{}}
                              historicalRecords={[]}
                              placeholder={t('query.query_placeholder2')}
                            />
                          </Form.Item>
                        </InputGroupWithFormItem>
                      </div>
                    </Col>
                  </Row>
                  <AdvancedSettings mode='graph' prefixField={field} prefixName={[field.name]} disabled={disabled} expanded showUnit />
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const cate = getFieldValue('cate');
                      const query = getFieldValue([...fullPrefixName, ...prefixName, 'queries', field.name]);

                      return <GraphPreview cate={cate} datasourceValue={datasourceID} query={query} />;
                    }}
                  </Form.Item>
                  {fields.length > 1 && (
                    <CloseCircleOutlined
                      style={{ position: 'absolute', right: -4, top: -4 }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </Card>
        )}
      </Form.List>
    </>
  );
}
