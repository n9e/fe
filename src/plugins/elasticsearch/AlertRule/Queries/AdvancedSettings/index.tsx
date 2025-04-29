import React from 'react';
import { Form, Space, Row, Col, InputNumber } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { SIZE } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import UnitPicker from '@/pages/dashboard/Components/UnitPicker';

interface Props {
  field: FormListFieldData;
}

export default function index(prosp: Props) {
  const { t } = useTranslation('alertRules');
  const { field } = prosp;
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div>
      <div className='mb1'>
        <Space
          className='cursor-pointer'
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {t('advanced_settings')}
          {expanded ? <DownOutlined /> : <RightOutlined />}
        </Space>
      </div>
      <div
        className='mb1'
        style={{
          display: expanded ? 'block' : 'none',
        }}
      >
        <Row gutter={SIZE * 2}>
          <Col span={6}>
            <InputGroupWithFormItem label={t('common:unit')}>
              <Form.Item {...field} name={[field.name, 'unit']} initialValue='none' noStyle>
                <UnitPicker optionLabelProp='cleanLabel' style={{ width: '100%' }} dropdownMatchSelectWidth={false} />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={6}>
            <InputGroupWithFormItem label='Offset (s)'>
              <Form.Item {...field} name={[field.name, 'offset']} noStyle>
                <InputNumber controls={false} min={0} />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
        </Row>
      </div>
    </div>
  );
}
