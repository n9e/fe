import React, { useState } from 'react';
import { Row, Col, Form, Input, Tooltip, Space, Select } from 'antd';
import { DownOutlined, RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import UnitPicker from '@/pages/dashboard/Components/UnitPicker';

interface IProps {
  span?: number;
  prefixField?: any;
  prefixName?: (string | number)[];
  disabled?: boolean;
  showUnit?: boolean;
}

function AdvancedSettings(props: IProps) {
  const { t } = useTranslation('db_doris');
  const { span = 8, prefixField = {}, prefixName = [], disabled, showUnit } = props;
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <span
          onClick={() => {
            setOpen(!open);
          }}
          style={{ cursor: 'pointer' }}
        >
          {open ? <DownOutlined /> : <RightOutlined />} {t('datasource:query.advancedSettings.title')}
        </span>
      </div>
      <div style={{ display: open ? 'block' : 'none' }}>
        <Row gutter={8}>
          <Col span={span}>
            <InputGroupWithFormItem
              label={
                <Space>
                  {t('datasource:query.advancedSettings.valueKey')}
                  <Tooltip title={t('datasource:query.advancedSettings.valueKey_tip')}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Form.Item
                {...prefixField}
                name={[...prefixName, 'keys', 'valueKey']}
                style={{ width: '100%' }}
                rules={[
                  {
                    required: true,
                    message: t('datasource:query.advancedSettings.valueKey_required'),
                  },
                ]}
              >
                <Select mode='tags' disabled={disabled} placeholder={t('count')} open={false} />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={span}>
            <InputGroupWithFormItem
              label={
                <Space>
                  {t('datasource:query.advancedSettings.labelKey')}
                  <Tooltip title={t('datasource:query.advancedSettings.labelKey_tip')}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Form.Item {...prefixField} name={[...prefixName, 'keys', 'labelKey']} style={{ width: '100%' }}>
                <Select mode='tags' disabled={disabled} placeholder={t('datasource:query.advancedSettings.tags_placeholder')} open={false} />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          {showUnit && (
            <Col span={span}>
              <InputGroupWithFormItem label={t('common:unit')}>
                <Form.Item {...prefixField} name={[prefixField.name, 'unit']} initialValue='none'>
                  <UnitPicker optionLabelProp='cleanLabel' style={{ width: '100%' }} dropdownMatchSelectWidth={false} />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
}

export default AdvancedSettings;
