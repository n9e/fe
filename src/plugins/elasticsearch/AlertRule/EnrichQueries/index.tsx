import React, { useState, useEffect, useContext } from 'react';
import { Form, Space, Tooltip } from 'antd';
import { PlusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';
import { getIndices } from '@/pages/explorer/Elasticsearch/services';
import EnhancedModal from '@/pages/alertRules/Form/components/EnhancedModal';
import CardContainer from '@/pages/alertRules/FormNG/components/CardContainer';
import { ANNOTATIONS_ENRICH_QUERIES_DOC_URL } from '@/pages/alertRules/constants';

// @ts-ignore
import EnrichQueryValuesMaxLen from 'plus:/parcels/AlertRule/NotifyExtra/EnrichQueryValuesMaxLen';

import Query from './Query';
import GraphPreview from './GraphPreview';
import './style.less';

interface IProps {
  disabled?: boolean;
}

export default function index(props: IProps) {
  const { t, i18n } = useTranslation('alertRules');
  const { darkMode } = useContext(CommonStateContext);
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
                <span>{t('alertRules:enrich_queries.title')}</span>
                <Tooltip title={t('alertRules:enrich_queries.tip')} overlayStyle={{ maxWidth: 400 }}>
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
                <a
                  onClick={() => {
                    DocumentDrawer({
                      language: i18n.language,
                      darkMode,
                      type: 'iframe',
                      title: t('common:page_help'),
                      documentPath: ANNOTATIONS_ENRICH_QUERIES_DOC_URL,
                    });
                  }}
                >
                  {t('common:page_help')}
                </a>
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
