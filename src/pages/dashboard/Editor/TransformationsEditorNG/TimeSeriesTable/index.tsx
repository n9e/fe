import React, { useContext } from 'react';
import { Button, Space, Form, Select } from 'antd';
import { InfoCircleOutlined, BugOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';

import EyeSwitch from '../../Components/EyeSwitch';
import Collapse, { Panel } from '../../Components/Collapse';
import useColumns from './useColumns';

interface Value {
  fieldName?: string;
  functions?: string[];
}

interface IProps {
  field: FormListFieldData;
  onClose: () => void;
  value?: Value;
  onChange?: (value: Value) => void;
}

export default function JoinByField(props: IProps) {
  const { t, i18n } = useTranslation('dashboard');
  const { darkMode } = useContext(CommonStateContext);
  const { field, onClose, value, onChange } = props;
  const { name, key, ...resetField } = field;
  const columns = useColumns({ fieldName: key });

  return (
    <Collapse>
      <Panel
        header={t('transformations.timeSeriesTable.title')}
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
                  title: t('transformations.timeSeriesTable.title'),
                  documentPath: '/n9e-docs/transformations/timeSeriesTable',
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
        <Form.Item label={t('transformations.timeSeriesTable.fieldName')}>
          <Select
            options={_.map(columns, (item) => ({ label: item, value: item }))}
            value={value?.fieldName}
            onChange={(val) => {
              if (onChange) {
                onChange({ ...(value || {}), fieldName: val });
              }
            }}
          />
        </Form.Item>
        <Form.Item label={t('transformations.timeSeriesTable.functions')}>
          <Select
            mode='multiple'
            options={_.map(['min', 'max', 'avg', 'sum', 'last', 'variance', 'stdDev', 'count'], (item) => ({
              label: t(`transformations.timeSeriesTable.functions_map.${item}`),
              value: item,
            }))}
            value={value?.functions}
            onChange={(val) => {
              if (onChange) {
                onChange({ ...(value || {}), functions: val });
              }
            }}
          />
        </Form.Item>
      </Panel>
    </Collapse>
  );
}
