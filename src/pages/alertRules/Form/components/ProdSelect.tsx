import React, { useContext } from 'react';
import { Form, Segmented } from 'antd';
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
  return prodOptions;
};

export default function ProdSelect({ label, onChange = () => {} }: IProps) {
  const { feats } = useContext(CommonStateContext);
  const prodOptions = getProdOptions(feats);
  const prod = Form.useWatch('prod');

  return (
    <>
      <Form.Item name='prod' hidden>
        <div />
      </Form.Item>
      <Form.Item label={label}>
        <Segmented
          value={prod}
          onChange={onChange}
          options={_.map(prodOptions, (item) => {
            return {
              label: (
                <div>
                  {item.label} {item.pro ? <ProSvg type='normal' /> : null}
                </div>
              ),
              value: item.value,
            };
          })}
        />
      </Form.Item>
    </>
  );
}
