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
  byField?: string; // 用于连接的字段（例如时间戳或 ID）
  mode?: 'outer' | 'inner'; // 连接类型
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
        header={t('transformations.joinByField.title')}
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
                  title: t('transformations.joinByField.title'),
                  documentPath: '/docs/transformations/joinByField',
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
        <Form.Item label={t('transformations.joinByField.mode')}>
          <Select
            options={_.map(['outer'], (item) => ({ label: item, value: item }))}
            value={value?.mode}
            onChange={(val) => {
              if (onChange) {
                onChange({ ...(value || {}), mode: val });
              }
            }}
          />
        </Form.Item>
        <Form.Item label={t('transformations.joinByField.byField')}>
          <Select
            options={_.map(columns, (item) => ({ label: item, value: item }))}
            value={value?.byField}
            onChange={(val) => {
              if (onChange) {
                onChange({ ...(value || {}), byField: val });
              }
            }}
          />
        </Form.Item>
      </Panel>
    </Collapse>
  );
}
