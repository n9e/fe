import React, { useContext } from 'react';
import { Form, Radio } from 'antd';
import _ from 'lodash';
import { ProSvg } from '@/components/DatasourceSelect';
import { CommonStateContext } from '@/App';
import { ruleTypeOptions } from '../constants';

interface IProps {
  label?: string;
  onChange?: (e: any) => void;
}

export const getProdOptions = (feats) => {
  const prodOptions = _.cloneDeep(ruleTypeOptions);

  if (feats?.fcBrain) {
    prodOptions.push({
      label: 'Anomaly',
      value: 'anomaly',
      pro: true,
    });
  }
  if (
    _.some(feats?.plugins, (plugin) => {
      return _.includes(plugin.type, 'logging');
    })
  ) {
    prodOptions.push({
      label: 'Log',
      value: 'logging',
      pro: true,
    });
  }
  return prodOptions;
};

export default function ProdSelect({ label, onChange = () => {} }: IProps) {
  const { feats } = useContext(CommonStateContext);
  const prodOptions = getProdOptions(feats);

  return (
    <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.prod !== currentValues.prod} noStyle>
      {({ getFieldValue }) => {
        const prod = getFieldValue('prod');
        return (
          <Form.Item name='prod' label={label}>
            <Radio.Group onChange={onChange} optionType='button' buttonStyle='solid'>
              {_.map(prodOptions, (item) => {
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
}
