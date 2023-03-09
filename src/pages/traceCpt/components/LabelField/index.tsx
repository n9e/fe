// 如果被Form.Item包裹则children上不能传onChange，否则会被覆盖掉
// 如果非得监听onChange，select可以用onSelect，input可以用onkeydown
// 不能直接监听value，因为通过程序也会修改value，而此时一般不必出发onChange事件

import React, { useEffect, cloneElement } from 'react';
import './index.less';
import classNames from 'classnames';
import { warning } from '@/utils';
interface IProps {
  label: string | React.ReactElement;
  children: React.ReactElement;
  value?: number | string;
  onChange?: (value: number | string) => void;
  required?: boolean;
}

export default function Index(props: IProps) {
  const { children, label, value, onChange, required } = props;

  useEffect(() => {
    if (children.props.onChange && onChange) {
      warning(`LabelField 如果被Form.Item包裹则children上不能传onChange，会被覆盖掉`);
    }
  }, []);

  return (
    <div className='label-field'>
      <span className={classNames({ 'label-field-name': true, required })}>{label}</span>
      {cloneElement(children, Object.assign({}, children.props, { value: value ? value : children.props.value, onChange: onChange ? onChange : children.props.onChange }))}
    </div>
  );
}
