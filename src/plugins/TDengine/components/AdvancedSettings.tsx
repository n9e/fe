import React, { useState } from 'react';
import { Row, Col, Form, Input, Tooltip, Select } from 'antd';
import { DownOutlined, RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  span?: number;
  prefixField?: any;
  prefixName?: (string | number)[];
  disabled?: boolean;
  mode: 'graph' | 'table';
}

function AdvancedSettings(props: IProps) {
  const { t } = useTranslation('db_aliyunSLS');
  const { span = 6, prefixField = {}, prefixName = [], disabled, mode } = props;
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <span
          onClick={() => {
            setOpen(!open);
          }}
          style={{ cursor: 'pointer' }}
        >
          {open ? <DownOutlined /> : <RightOutlined />} {t('query.advancedSettings.title')}
        </span>
      </div>
      <div style={{ display: open ? 'block' : 'none' }}>
        <Row gutter={8}>
          {mode === 'graph' && (
            <>
              <Col span={span}>
                <InputGroupWithFormItem
                  label={
                    <span>
                      ValueKey{' '}
                      <Tooltip title={t('query.advancedSettings.valueKey_tip')}>
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </span>
                  }
                  labelWidth={100}
                >
                  <Form.Item {...prefixField} name={[...prefixName, 'keys', 'valueKey']} style={{ width: '100%' }}>
                    <Select mode='tags' placeholder={t('query.advancedSettings.tags_placeholder')} disabled={disabled} />
                  </Form.Item>
                </InputGroupWithFormItem>
              </Col>
              <Col span={span}>
                <InputGroupWithFormItem
                  label={
                    <span>
                      LabelKey{' '}
                      <Tooltip title={t('query.advancedSettings.labelKey_tip')}>
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </span>
                  }
                  labelWidth={100}
                >
                  <Form.Item {...prefixField} name={[...prefixName, 'keys', 'labelKey']} style={{ width: '100%' }}>
                    <Select mode='tags' placeholder={t('query.advancedSettings.tags_placeholder')} disabled={disabled} />
                  </Form.Item>
                </InputGroupWithFormItem>
              </Col>
            </>
          )}

          <Col span={span}>
            <InputGroupWithFormItem
              label={
                <span>
                  TimeFormat{' '}
                  <Tooltip title={t('query.advancedSettings.timeFormat_tip')}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              labelWidth={105}
            >
              <Form.Item {...prefixField} name={[...prefixName, 'keys', 'timeFormat']} style={{ width: '100%' }} initialValue='%H:%i:%s'>
                <Input disabled={disabled} />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AdvancedSettings;
