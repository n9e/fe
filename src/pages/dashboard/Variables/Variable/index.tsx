import React, { useEffect, useState } from 'react';
import _ from 'lodash';

import { IVariable } from '../types';

import Constant from './Constant';
import Custom from './Custom';
import Datasource from './Datasource';
import DatasourceIdentifier from './DatasourceIdentifier';
import HostIdent from './HostIdent';
import Query from './Query';
import Textbox from './Textbox';

interface Props {
  variableValueFixed: boolean;
  item: IVariable;
  value: IVariable['value'];
}

export default function index(props: Props) {
  const { item } = props;
  const { type, value: propValue, multi, hide } = item;

  const [value, setValue] = useState<IVariable['value']>(propValue);

  useEffect(() => {
    let curValue = propValue;
    if (type === 'query' || type === 'custom') {
      if (multi) {
        // 开启多选时，如果 value 为字符串，需要转为数组
        curValue = Array.isArray(propValue) ? propValue : propValue ? ([propValue] as string[]) : [];
      } else {
        // 未开启多选时，如果 value 为数组，只取第一个值
        curValue = Array.isArray(propValue) ? (propValue[0] as string) : propValue;
      }
    }
    setValue(curValue);
  }, [JSON.stringify(propValue)]);

  const subProps = {
    ...props,
    value,
    setValue,
  };

  // 兼容旧数据，constant 的 hide 默认为 true
  if (hide || (type === 'constant' && hide === undefined)) return null;

  if (type === 'constant') {
    return <Constant {...subProps} />;
  }
  if (type === 'custom') {
    return <Custom {...subProps} />;
  }
  if (type === 'datasource') {
    return <Datasource {...subProps} />;
  }
  if (type === 'datasourceIdentifier') {
    return <DatasourceIdentifier {...subProps} />;
  }
  if (type === 'hostIdent') {
    return <HostIdent {...subProps} />;
  }
  if (type === 'query') {
    return <Query {...subProps} />;
  }
  if (type === 'textbox') {
    return <Textbox {...subProps} />;
  }
  return null;
}
