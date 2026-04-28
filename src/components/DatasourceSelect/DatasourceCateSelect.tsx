import React, { useContext } from 'react';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Cate } from '@/components/AdvancedWrap';
import { getCateDisplayLabel } from '@/components/AdvancedWrap/utils';
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
  const { i18n } = useTranslation();
  const { datasourceCateOptions } = useContext(CommonStateContext);
  const cates = filterCates ? filterCates(datasourceCateOptions) : datasourceCateOptions;

  return (
    <Select {...props} optionLabelProp='label' disabled={disabled}>
      {_.map(cates, (item) => {
        const displayLabel = getCateDisplayLabel(item, i18n.language);
        return (
          <Select.Option value={item.value} key={item.value} label={displayLabel}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {displayLabel}
              {item[`${scene}Pro`] ? <ProSvg /> : null}
            </div>
          </Select.Option>
        );
      })}
    </Select>
  );
}
