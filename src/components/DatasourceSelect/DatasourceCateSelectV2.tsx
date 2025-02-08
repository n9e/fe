import React, { useContext } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Cate } from '@/components/AdvancedWrap';
import { CommonStateContext } from '@/App';
import './style.less';

interface IProps {
  value?: string;
  onChange?: (value: string, record: Cate) => void;
  filterCates?: (cates: Cate[]) => Cate[];
  disabled?: boolean;
}

export default function DatasourceCateSelectV2(props: IProps) {
  const { value, onChange, filterCates, disabled } = props;
  const { datasourceCateOptions } = useContext(CommonStateContext);
  const cates = filterCates ? filterCates(datasourceCateOptions) : datasourceCateOptions;

  return (
    <div className='n9e-db-cate-grid'>
      {_.map(cates, (item) => {
        return (
          <div
            key={item.value}
            className={classNames('n9e-db-cate-grid-item', {
              'n9e-db-cate-grid-item-selected': value === item.value,
            })}
            onClick={() => {
              onChange && onChange(item.value, item);
            }}
          >
            <img src={item.logo} style={{ height: 42 }} />
            <div>{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}
