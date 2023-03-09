import React from 'react';
import { Form, Radio } from 'antd';
import AdvancedWrap from '@/components/AdvancedWrap';
import { ruleTypeOptions } from '../constants';

interface IProps {
  label?: string;
  onChange?: (e: any) => void;
}

export default function ProdSelect({ label, onChange = () => {} }: IProps) {
  return (
    <AdvancedWrap var='VITE_IS_ALERT_AI,VITE_IS_ALERT_ES'>
      {(isShow) => {
        let options = ruleTypeOptions;
        if (isShow[0]) {
          options = [
            ...ruleTypeOptions,
            {
              label: 'Anomaly',
              value: 'anomaly',
            },
          ];
        } else if (isShow[1]) {
          options = [
            ...ruleTypeOptions,
            {
              label: 'Log',
              value: 'logging',
            },
          ];
        }
        return (
          <Form.Item name='prod' label={label}>
            <Radio.Group options={options} onChange={onChange} optionType='button' buttonStyle='solid' />
          </Form.Item>
        );
      }}
    </AdvancedWrap>
  );
}
