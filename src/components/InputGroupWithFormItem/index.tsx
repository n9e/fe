import React, { CSSProperties } from 'react';
import { Input } from 'antd';
import classNames from 'classnames';
import './style.less';

interface IProps {
  children: React.ReactNode;
  label: React.ReactNode;
  labelWidth?: number | string;
  noStyle?: boolean;
  customStyle?: CSSProperties;
  addonAfter?: React.ReactNode;
  addonAfterWithContainer?: React.ReactNode;
}

export default function index(props: IProps) {
  const { children, label, labelWidth = 'max-content', noStyle = false, customStyle, addonAfter, addonAfterWithContainer } = props;
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
          ...customStyle,
        }}
      >
        {label}
      </span>
      <div className='input-group-with-form-item-content'>{children}</div>
      {addonAfter && <span className='ant-input-group-addon'>{addonAfter}</span>}
      {addonAfterWithContainer}
    </Input.Group>
  );
}
