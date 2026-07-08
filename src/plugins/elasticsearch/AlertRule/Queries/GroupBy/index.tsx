import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { useTranslation } from 'react-i18next';

import { getFullFields } from '@/pages/explorer/Elasticsearch/services';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';

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

export default function GroupBy({ prefixField = {}, prefixFieldNames = [], parentNames = [], datasourceValue, index, disabled }: IProps) {
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
          <div className='mb-2'>Group By</div>
          {fields.map((field) => {
            return (
              <CardContainer key={field.key} onClose={() => remove(field.name)} className='mb-4 bg-fc-150 pb-0'>
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const cate = getFieldValue([...parentNames, ...prefixFieldNames, 'group_by', field.name, 'cate']);
                    const values = getFieldValue([...parentNames, ...prefixFieldNames, 'values']);
                    const valuesWithoutCount = _.filter(values, (item) => item.func !== 'count');
                    return (
                      <div>
                        {cate === 'filters' && <Filters prefixField={field} />}
                        {cate === 'terms' && <Terms prefixField={field} fieldsOptions={fieldsOptions} values={valuesWithoutCount} />}
                        {cate === 'histgram' && <Histgram prefixField={field} />}
                      </div>
                    );
                  }}
                </Form.Item>
              </CardContainer>
            );
          })}
          <Button
            className='w-full mb-4'
            type='dashed'
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
            icon={<PlusOutlined />}
          >
            添加 Group By
          </Button>
        </div>
      )}
    </Form.List>
  );
}
