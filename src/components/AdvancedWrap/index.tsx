import React, { useContext } from 'react';
import _ from 'lodash';
import { CommonStateContext } from '@/App';
// @ts-ignore
import License, { getLicense } from 'plus:/components/License';
export { getAuthorizedDatasourceCates } from './utils';
export type { Cate } from './utils';
export { License, getLicense };

interface IProps {
  var?: string; // 变量名，多个用逗号分隔
  children: React.ReactNode | ((isShow: boolean[], isExpired: boolean) => React.ReactNode);
}

export default function index(props: IProps) {
  const { licenseExpired } = useContext(CommonStateContext);

  let vars: string[] = [];
  if (props.var) {
    if (props.var.indexOf(',') > -1) {
      vars = props.var.split(',');
    } else {
      vars = [props.var];
    }
    const result = _.map(vars, (item) => {
      return import.meta.env[item] === 'true';
    });
    if (_.some(result, (item) => item === true)) {
      if (typeof props.children === 'function') {
        return <div>{props.children(result, licenseExpired)}</div>;
      }
      return <div>{props.children}</div>;
    }
  }
  if (typeof props.children === 'function') {
    return <div>{props.children([false], licenseExpired)}</div>;
  }
  return null;
}
