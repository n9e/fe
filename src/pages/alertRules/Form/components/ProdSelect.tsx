import React from 'react';
import { Form, Radio } from 'antd';
import _ from 'lodash';
import AdvancedWrap from '@/components/AdvancedWrap';
import { ProSvg } from '@/components/DatasourceSelect';
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
            ...options,
            {
              label: 'Anomaly',
              value: 'anomaly',
              pro: true,
            },
          ];
        }
        if (isShow[1]) {
          options = [
            ...options,
            {
              label: 'Log',
              value: 'logging',
              pro: true,
            },
          ];
        }
        return (
          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.prod !== currentValues.prod}>
            {({ getFieldValue }) => {
              const prod = getFieldValue('prod');
              return (
                <Form.Item name='prod' label={label}>
                  <Radio.Group onChange={onChange} optionType='button' buttonStyle='solid'>
                    {_.map(options, (item) => {
                      return (
                        <Radio value={item.value}>
                          <div>
                            {item.label} {item.pro ? <ProSvg type={prod === item.value ? 'selected' : 'normal'} /> : null}
                          </div>
                        </Radio>
                      );
                    })}
                  </Radio.Group>
                </Form.Item>
              );
            }}
          </Form.Item>
        );
      }}
    </AdvancedWrap>
  );
}
