import React, { useState } from 'react';
import { Row, Col, Form, Tooltip, Select, Space, InputNumber } from 'antd';
import { DownOutlined, RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import UnitPicker from '@/pages/dashboard/Components/UnitPicker';

import { NAME_SPACE } from '../constants';

interface IProps {
  span?: number;
  prefixField?: any;
  prefixName?: (string | number)[];
  disabled?: boolean;
  expanded?: boolean;
  expandTriggerVisible?: boolean;
  onChange?: (key: string, value: any) => void;
  options?: any[];
  showUnit?: boolean;
  showOffset?: boolean;
}

function AdvancedSettings(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { span = 6, prefixField = {}, prefixName = [], disabled, expandTriggerVisible = true, onChange, options = [], showUnit, showOffset } = props;
  const [open, setOpen] = useState(!!props.expanded);

  return (
    <div>
      {expandTriggerVisible && (
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
      )}
      <div style={{ display: open ? 'block' : 'none' }}>
        <Row gutter={8}>
          <>
            <Col span={span}>
              <InputGroupWithFormItem
                label={
                  <Space>
                    {t('query.advancedSettings.valueKey')}
                    <Tooltip title={t('query.advancedSettings.valueKey_tip')}>
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
                      message: t('query.advancedSettings.valueKey_required'),
                    },
                  ]}
                >
                  <Select
                    mode='tags'
                    disabled={disabled}
                    placeholder={t('query.advancedSettings.tags_placeholder')}
                    open={_.isEmpty(options) ? false : undefined}
                    onChange={(val) => {
                      onChange && onChange('valueKey', val);
                    }}
                    options={options}
                  />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
            <Col span={span}>
              <InputGroupWithFormItem
                label={
                  <Space>
                    {t('query.advancedSettings.labelKey')}
                    <Tooltip title={t('query.advancedSettings.labelKey_tip')}>
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Form.Item {...prefixField} name={[...prefixName, 'keys', 'labelKey']} style={{ width: '100%' }}>
                  <Select
                    mode='tags'
                    placeholder={t('query.advancedSettings.tags_placeholder')}
                    disabled={disabled}
                    open={_.isEmpty(options) ? false : undefined}
                    onChange={(val) => {
                      onChange && onChange('labelKey', val);
                    }}
                    options={options}
                  />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
            {showUnit && (
              <Col span={span}>
                <InputGroupWithFormItem label={t('common:unit')}>
                  <Form.Item {...prefixField} name={[...prefixName, 'unit']} initialValue='none' noStyle>
                    <UnitPicker optionLabelProp='cleanLabel' style={{ width: '100%' }} dropdownMatchSelectWidth={false} />
                  </Form.Item>
                </InputGroupWithFormItem>
              </Col>
            )}
            {showOffset && (
              <Col span={span}>
                <InputGroupWithFormItem
                  label={
                    <Space>
                      {t('query.offset')}
                      <Tooltip
                        title={
                          <Trans
                            ns={NAME_SPACE}
                            i18nKey='query.offset_tip'
                            components={{
                              br: <br />,
                            }}
                          />
                        }
                      >
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                >
                  <Form.Item {...prefixField} name={[...prefixName, 'offset']} initialValue={0}>
                    <InputNumber addonAfter={t('common:time.second')} min={0} className='w-full' />
                  </Form.Item>
                </InputGroupWithFormItem>
              </Col>
            )}
          </>
        </Row>
      </div>
    </div>
  );
}

export default AdvancedSettings;
