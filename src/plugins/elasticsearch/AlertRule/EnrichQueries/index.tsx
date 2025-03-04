import React, { useState, useEffect } from 'react';
import { Form, Space } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { getIndices } from '@/pages/explorer/Elasticsearch/services';

import Query from './Query';
import GraphPreview from './GraphPreview';
import './style.less';

// @ts-ignore
import EnrichQueryValuesMaxLen from '@/plus/parcels/AlertRule/NotifyExtra/EnrichQueryValuesMaxLen';

interface IProps {
  disabled?: boolean;
}

export default function index(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { disabled } = props;
  const [indexOptions, setIndexOptions] = useState<any[]>([]);
  const names = ['extra_config', 'enrich_queries'];
  const datasourceValue = Form.useWatch('datasource_value');
  const namesValue = Form.useWatch(names) ?? [];

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
    <>
      <Form.List name={names}>
        {(fields, { add, remove }) => (
          <div>
            <div style={{ marginBottom: 8 }}>
              <Space>
                <span>{t('db_aliyunSLS:enrich_queries.title')}</span>
                <PlusCircleOutlined
                  disabled={disabled}
                  onClick={() =>
                    add({
                      interval_unit: 'min',
                      interval: 1,
                      date_field: '@timestamp',
                      value: {
                        func: 'rawData',
                      },
                    })
                  }
                />
              </Space>
            </div>
            {fields.map((field) => {
              return (
                <Query key={field.key} field={field} datasourceValue={datasourceValue} indexOptions={indexOptions} disabled={disabled}>
                  <CloseCircleOutlined
                    style={{ position: 'absolute', right: -4, top: -4 }}
                    onClick={() => {
                      remove(field.name);
                    }}
                    disabled={disabled}
                  />
                </Query>
              );
            })}
            {fields.length > 0 && <GraphPreview datasourceValue={datasourceValue} />}
          </div>
        )}
      </Form.List>
      <div className='mt1'>
        <EnrichQueryValuesMaxLen hidden={namesValue.length === 0} />
      </div>
    </>
  );
}
