import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { getFields, getFullFields } from '@/pages/explorer/Elasticsearch/services';
import Filters from './Filters';
import Terms from './Terms';
import Histgram from './Histgram';

interface IProps {
  parentNames?: (string | number)[]; // 前缀字段名的父级路径
  prefixField?: any;
  prefixFieldNames?: (string | number)[]; // 前缀字段名路径
  datasourceValue: number;
  index: string; // ES 索引
  disabled?: boolean;
}

export default function index({ prefixField = {}, prefixFieldNames = [], parentNames = [], datasourceValue, index, disabled }: IProps) {
  const { t } = useTranslation('alertRules');
  const [fieldsOptions, setFieldsOptions] = useState<any[]>([]);
  const { run } = useDebounceFn(
    () => {
      getFullFields(datasourceValue, index, {
        includeSubFields: true,
      }).then((res) => {
        setFieldsOptions(
          _.map(res.allFields, (item) => {
            return {
              value: item.name,
            };
          }),
        );
      });
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    if (datasourceValue && index) {
      run();
    }
  }, [datasourceValue, index]);

  return (
    <Form.List {...prefixField} name={[...prefixFieldNames, 'group_by']}>
      {(fields, { add, remove }) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            Group By{' '}
            <PlusCircleOutlined
              style={{ cursor: 'pointer' }}
              onClick={() => {
                add({
                  cate: 'terms',
                  params: [
                    {
                      alias: '',
                      query: '',
                    },
                  ],
                });
              }}
              disabled={disabled}
            />
          </div>
          {fields.map((field) => {
            return (
              <div key={field.key} style={{ marginBottom: 0 }}>
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const cate = getFieldValue([...parentNames, ...prefixFieldNames, 'group_by', field.name, 'cate']);
                    const values = getFieldValue([...parentNames, ...prefixFieldNames, 'values']);
                    const valuesWithoutCount = _.filter(values, (item) => item.func !== 'count');
                    return (
                      <Row gutter={10} align='top'>
                        <Col flex='auto'>
                          <div>
                            {cate === 'filters' && <Filters prefixField={field} />}
                            {cate === 'terms' && <Terms prefixField={field} fieldsOptions={fieldsOptions} values={valuesWithoutCount} />}
                            {cate === 'histgram' && <Histgram prefixField={field} />}
                          </div>
                        </Col>
                        <Col flex='40px' style={{ display: 'flex', alignItems: 'center' }}>
                          <div
                            onClick={() => {
                              remove(field.name);
                            }}
                            style={{ height: 32, lineHeight: '32px' }}
                          >
                            <MinusCircleOutlined style={{ cursor: 'pointer' }} />
                          </div>
                        </Col>
                      </Row>
                    );
                  }}
                </Form.Item>
              </div>
            );
          })}
        </div>
      )}
    </Form.List>
  );
}
