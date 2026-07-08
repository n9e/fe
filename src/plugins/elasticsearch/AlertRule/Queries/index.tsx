import React, { useState, useEffect } from 'react';
import { Form, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { getIndices } from '@/pages/explorer/Elasticsearch/services';
import { generateQueryName } from '@/components/QueryName';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';
import Query from './Query';

interface IProps {
  hideIndexPattern?: boolean;
  datasourceValue: number;
  form: any;
  disabled?: boolean;
}

export default function index(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { hideIndexPattern, datasourceValue, form, disabled } = props;
  const [indexOptions, setIndexOptions] = useState<any[]>([]);
  const names = ['rule_config', 'queries'];
  const queries = Form.useWatch(names);

  useEffect(() => {
    if (datasourceValue !== undefined) {
      getIndices(datasourceValue).then((res) => {
        setIndexOptions(
          _.map(res, (item) => {
            return {
              value: item,
            };
          }),
        );
      });
    }
  }, [datasourceValue]);

  return (
    <Form.List
      name={names}
      initialValue={[
        {
          ref: 'A',
        },
      ]}
    >
      {(fields, { add, remove }) => (
        <div>
          <FormItemLabel>{t('datasource:es.alert.query.title')}</FormItemLabel>
          {fields.map((field) => {
            return (
              <Query
                key={field.key}
                field={field}
                hideIndexPattern={hideIndexPattern}
                datasourceValue={datasourceValue}
                indexOptions={indexOptions}
                disabled={disabled}
                onClose={fields.length > 1 ? () => remove(field.name) : undefined}
              />
            );
          })}
          <Button
            className='w-full'
            type='dashed'
            disabled={disabled}
            onClick={() =>
              add({
                ref: generateQueryName(_.map(queries, 'ref')),
                interval_unit: 'min',
                interval: 5,
                date_field: '@timestamp',
                value: {
                  func: 'count',
                },
              })
            }
            icon={<PlusOutlined />}
          >
            {t('datasource:es.alert.query.title')}
          </Button>
        </div>
      )}
    </Form.List>
  );
}
