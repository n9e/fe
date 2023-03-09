import React from 'react';
import { Input } from 'antd';
import classNames from 'classnames';
import './style.less';

interface IProps {
  children: React.ReactNode;
  label: React.ReactNode;
  labelWidth?: number | string;
  noStyle?: boolean;
}

export default function index(props: IProps) {
  const { children, label, labelWidth = 'max-content', noStyle = false } = props;
  return (
    <Input.Group compact className='input-group-with-form-item'>
      <span
        className={classNames({
          'ant-input-group-addon': !noStyle,
          'input-group-with-form-item-label': true,
        })}
        style={{
          width: labelWidth,
          maxWidth: 'unset',
        }}
      >
        {label}
      </span>
      <div className='input-group-with-form-item-content'>{children}</div>
    </Input.Group>
  );
}
