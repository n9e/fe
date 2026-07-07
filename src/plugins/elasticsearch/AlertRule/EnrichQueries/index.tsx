import React, { useState, useEffect } from 'react';
import { Form, Space, Tooltip } from 'antd';
import { PlusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { getIndices } from '@/pages/explorer/Elasticsearch/services';
import EnhancedModal from '@/pages/alertRules/Form/components/EnhancedModal';
import CardContainer from '@/pages/alertRules/FormNG/components/CardContainer';

// @ts-ignore
import EnrichQueryValuesMaxLen from 'plus:/parcels/AlertRule/NotifyExtra/EnrichQueryValuesMaxLen';

import Query from './Query';
import GraphPreview from './GraphPreview';
import './style.less';

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
  const queries = Form.useWatch(['rule_config', 'queries']) || [];

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
            <div className='mb-2'>
              <Space>
                <span>{t('db_aliyunSLS:enrich_queries.title')}</span>
                <Tooltip title={t('alertRules:enrich_queries.tip')}>
                  <InfoCircleOutlined />
                </Tooltip>
                <PlusCircleOutlined
                  disabled={disabled}
                  onClick={() => {
                    EnhancedModal({
                      queries,
                      add,
                    });
                  }}
                />
              </Space>
            </div>
            <div className='mb-4'>
              {fields.map((field) => {
                return (
                  <CardContainer key={field.key} onClose={() => remove(field.name)}>
                    <Query field={field} datasourceValue={datasourceValue} indexOptions={indexOptions} disabled={disabled} />
                  </CardContainer>
                );
              })}
            </div>
            {fields.length > 0 && <GraphPreview datasourceValue={datasourceValue} />}
          </div>
        )}
      </Form.List>
      <div className='mt-4'>
        <EnrichQueryValuesMaxLen hidden={namesValue.length === 0} />
      </div>
    </>
  );
}
