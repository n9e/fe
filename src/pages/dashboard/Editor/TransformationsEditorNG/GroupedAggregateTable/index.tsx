import React, { useContext } from 'react';
import { Button, Space, Form, Select, Row, Col, Empty, Alert } from 'antd';
import { InfoCircleOutlined, BugOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { TableData } from '@/pages/dashboard/transformations/types';

import EyeSwitch from '../../Components/EyeSwitch';
import Collapse, { Panel } from '../../Components/Collapse';
import useColumns from './useColumns';

interface Value {
  fields: {
    [fieldName: string]: {
      aggregations: (keyof NonNullable<TableData['fields'][0]['state']['calcs']>)[]; // 聚合函数列表
      operation: 'aggregate' | 'groupby';
    };
  };
}

interface IProps {
  field: FormListFieldData;
  onClose: () => void;
  value?: Value;
  onChange?: (value: Value) => void;
}

export default function GroupedAggregateTable(props: IProps) {
  const { t, i18n } = useTranslation('dashboard');
  const { darkMode } = useContext(CommonStateContext);
  const { field, onClose, value, onChange } = props;
  const { name, key, ...resetField } = field;
  const { columns, error } = useColumns({ fieldName: field.name });

  return (
    <Collapse>
      <Panel
        header={t('transformations.groupedAggregateTable.title')}
        extra={
          <Space size={2}>
            <Button
              icon={<InfoCircleOutlined />}
              type='text'
              size='small'
              onClick={() => {
                DocumentDrawer({
                  language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                  darkMode,
                  title: t('transformations.groupedAggregateTable.title'),
                  documentPath: '/n9e-docs/transformations/groupedAggregateTable',
                });
              }}
            />
            {/* <Button icon={<BugOutlined />} type='text' size='small' /> */}
            <Form.Item {...resetField} name={[name, 'disabled']} noStyle>
              <EyeSwitch />
            </Form.Item>
            <Button
              icon={<DeleteOutlined />}
              type='text'
              size='small'
              onClick={() => {
                onClose();
              }}
            />
          </Space>
        }
      >
        {error ? (
          <Alert message={error} type='error' />
        ) : _.isEmpty(columns) ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          _.map(columns, (field, index) => {
            const fieldConfig = _.find(value?.fields, (configValue, fieldName) => {
              return fieldName === field;
            });
            return (
              <Row gutter={8} key={field + index} className='mb-2'>
                <Col flex='none'>
                  <InputGroupWithFormItem label={field}>
                    <Select
                      allowClear
                      placeholder='ignored'
                      options={_.map(['aggregate', 'groupby'], (item) => {
                        return { label: t(`transformations.groupedAggregateTable.operation_map.${item}`), value: item };
                      })}
                      value={fieldConfig?.operation}
                      onChange={(val) => {
                        onChange &&
                          onChange({
                            ...(value || {}),
                            fields: {
                              ...(value?.fields || {}),
                              [field]: {
                                ...(value?.fields?.[field] || {}),
                                operation: val as 'aggregate' | 'groupby',
                                aggregations: value?.fields?.[field]?.aggregations ?? [],
                              },
                            },
                          });
                      }}
                    />
                  </InputGroupWithFormItem>
                </Col>
                {fieldConfig?.operation === 'aggregate' && (
                  <Col flex='auto'>
                    <InputGroupWithFormItem label={field}>
                      <Select
                        className='w-full'
                        mode='multiple'
                        options={_.map(['min', 'max', 'avg', 'sum', 'last', 'variance', 'stdDev', 'count'], (item) => ({
                          label: t(`calcs.${item}`),
                          value: item,
                        }))}
                        value={fieldConfig?.aggregations}
                        onChange={(val) => {
                          onChange &&
                            onChange({
                              ...(value || {}),
                              fields: {
                                ...(value?.fields || {}),
                                [field]: {
                                  ...(value?.fields?.[field] || {}),
                                  aggregations: val,
                                  operation: value?.fields?.[field]?.operation as 'aggregate' | 'groupby',
                                },
                              },
                            });
                        }}
                      />
                    </InputGroupWithFormItem>
                  </Col>
                )}
              </Row>
            );
          })
        )}
      </Panel>
    </Collapse>
  );
}
