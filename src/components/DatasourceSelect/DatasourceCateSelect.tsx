import React from 'react';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import { getAuthorizedDatasourceCates, Cate } from '@/components/AdvancedWrap';

interface IProps extends SelectProps {
  scene: 'graph' | 'alert';
  filterCates?: (cates: Cate[]) => Cate[];
  disabled?: boolean;
}

export const ProSvg = ({ type = 'normal' }) => (
  <div
    style={{
      border: `1px solid ${type === 'selected' ? '#fff' : '#6C53B1'}`,
      color: '#fff',
      background: '#6C53B1',
      display: 'inline-block',
      borderRadius: 2,
      padding: '2px 6px',
      fontSize: 12,
      fontWeight: 'bolder',
      fontFamily: 'PingFangSC-Regular',
      lineHeight: 1,
      transform: 'scale(0.8)',
    }}
  >
    Pro
  </div>
);

export default function DatasourceCateSelect({ filterCates, scene, disabled, ...props }: IProps) {
  let cates = getAuthorizedDatasourceCates();
  cates = filterCates ? filterCates(cates) : cates;

  return (
    <Select {...props} optionLabelProp='label' disabled={disabled}>
      {_.map(cates, (item) => {
        return (
          <Select.Option value={item.value} key={item.value} label={item.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {item.label}
              {item[`${scene}Pro`] ? <ProSvg /> : null}
            </div>
          </Select.Option>
        );
      })}
    </Select>
  );
}
