import React, { useContext } from 'react';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import classNames from 'classnames';
import { Cate } from '@/components/AdvancedWrap';
import { CommonStateContext } from '@/App';
import './style.less';

interface IProps extends SelectProps {
  scene: 'graph' | 'alert';
  filterCates?: (cates: Cate[]) => Cate[];
  disabled?: boolean;
}

export const ProSvg = ({ type = 'normal' }) => (
  <div
    className={classNames({
      'n9e-pro-tag': true,
      'n9e-pro-tag-selected': type === 'selected',
    })}
  >
    Pro
  </div>
);

export default function DatasourceCateSelect({ filterCates, scene, disabled, ...props }: IProps) {
  const { datasourceCateOptions } = useContext(CommonStateContext);
  const cates = filterCates ? filterCates(datasourceCateOptions) : datasourceCateOptions;

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
