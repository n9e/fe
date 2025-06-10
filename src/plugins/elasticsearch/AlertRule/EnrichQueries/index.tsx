import React, { useState, useEffect } from 'react';
import { Form, Space, Modal, Select } from 'antd';
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
  const form = Form.useFormInstance();
  const [indexOptions, setIndexOptions] = useState<any[]>([]);
  const names = ['extra_config', 'enrich_queries'];
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRef, setSelectedRef] = useState<string | undefined>();
  const datasourceValue = Form.useWatch('datasource_value');
  const namesValue = Form.useWatch(names, form) ?? [];
  const queries = Form.useWatch(['rule_config', 'queries'], form) || [];
  const queryOptions = queries.map((item) => ({
    label: item?.ref,
    value: item?.ref,
  }));

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
        {(fields, { remove }) => (
          <div>
            <div style={{ marginBottom: 8 }}>
              <Space>
                <span>{t('db_aliyunSLS:enrich_queries.title')}</span>
                <PlusCircleOutlined
                  disabled={disabled}
                  onClick={() => {
                    setModalVisible(true);
                    setSelectedRef(undefined);
                  }}
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
      <Modal
        title={<span>{t('db_aliyunSLS:enrich_queries.title')}</span>}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => {
          if (form) {
            const newEnrichQueries = (form.getFieldValue(['extra_config', 'enrich_queries']) || []).slice();
            if (!selectedRef) {
              // 选择为空，新增一个空 enrich_query
              newEnrichQueries.push({
                interval_unit: 'min',
                interval: 1,
                date_field: '@timestamp',
                value: { func: 'rawData' },
              });
            } else {
              const selectedQuery = queries.find((item) => item.ref === selectedRef);
              const existIndex = newEnrichQueries.findIndex((item) => item.extra_query && item.extra_query.ref === selectedRef);
              if (selectedQuery) {
                const enrichData = {
                  index: selectedQuery.index,
                  filter: selectedQuery.filter,
                  interval: selectedQuery.interval,
                  interval_unit: selectedQuery.interval_unit,
                  date_field: selectedQuery.date_field,
                  value: selectedQuery.value,
                  extra_query: selectedQuery,
                };
                if (existIndex > -1) {
                  // 只更新字段，保留原对象
                  Object.assign(newEnrichQueries[existIndex], enrichData);
                } else {
                  // 新增
                  newEnrichQueries.push(enrichData);
                }
              }
            }
            form.setFieldsValue({
              extra_config: {
                ...form.getFieldValue('extra_config'),
                enrich_queries: newEnrichQueries,
              },
            });
          }
          setModalVisible(false);
        }}
      >
        <Select className='w-full' options={queryOptions} value={selectedRef} onChange={setSelectedRef} allowClear />
      </Modal>
    </>
  );
}
