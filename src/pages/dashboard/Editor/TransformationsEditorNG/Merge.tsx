import React, { useContext } from 'react';
import { Button, Space, Form } from 'antd';
import { InfoCircleOutlined, BugOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';

import EyeSwitch from '../Components/EyeSwitch';
import Collapse, { Panel } from '../Components/Collapse';

interface IProps {
  field: FormListFieldData;
  onClose: () => void;
}

export default function Merge(props: IProps) {
  const { t, i18n } = useTranslation('dashboard');
  const { darkMode } = useContext(CommonStateContext);
  const { field, onClose } = props;
  const { name, key, ...resetField } = field;

  return (
    <Collapse>
      <Panel
        header={t('transformations.merge.title')}
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
                  title: t('transformations.merge.title'),
                  documentPath: '/docs/transformations/merge',
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
      />
    </Collapse>
  );
}
