import React, { useState, useEffect } from 'react';
import { Select, Tooltip } from 'antd';
import _ from 'lodash';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { getMonObjectList } from '@/services/targets';

import { useGlobalState } from '../../globalState';
import { IVariable } from '../types';
import getValueByOptions from '../utils/getValueByOptions';
import filterOptionsByReg from '../utils/filterOptionsByReg';
import { Props } from './types';

export default function HostIdent(props: Props) {
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const { item, formatedReg, variableValueFixed, onChange, value, setValue } = props;
  const { name, label, options, multi, allOption } = item;
  const latestItemRef = React.useRef<IVariable>(item);
  const [data, setData] = useState<{
    list: string[];
    flag: string;
  }>({
    list: [],
    flag: '',
  });

  useEffect(() => {
    latestItemRef.current = item;
  });

  useEffect(() => {
    getMonObjectList({
      gids: dashboardMeta.group_id,
      p: 1,
      limit: 5000,
    }).then((res) => {
      setData({
        list: _.uniq(_.map(res?.dat?.list, 'ident')),
        flag: _.uniqueId('flag_'),
      });
    });
  }, [formatedReg]);

  useEffect(() => {
    if (data.flag) {
      const itemClone = _.cloneDeep(latestItemRef.current);
      const options = data.list;
      const itemOptions = _.sortBy(filterOptionsByReg(_.map(options, _.toString), formatedReg), 'value');

      onChange({
        options: itemOptions,
        value: getValueByOptions({
          variableValueFixed,
          variable: itemClone,
          itemOptions,
        }),
      });
    }
  }, [formatedReg, data.flag]);

  return (
    <div>
      <InputGroupWithFormItem label={label || name}>
        <Select
          allowClear
          mode={multi ? 'tags' : undefined}
          style={{
            width: '180px',
          }}
          maxTagCount='responsive'
          onChange={(v) => {
            let val = v;
            if (_.isArray(v)) {
              const curVal = _.last(v);
              if (curVal === 'all') {
                val = ['all'];
              } else if (v.includes('all')) {
                val = _.without(v, 'all');
              }
            }
            setValue(val);
            onChange({
              value: val,
            });
          }}
          defaultActiveFirstOption={false}
          showSearch
          dropdownMatchSelectWidth={_.toNumber(options?.length) > 100}
          value={value}
          dropdownClassName='overflow-586'
          maxTagPlaceholder={(omittedValues) => {
            return (
              <Tooltip
                title={
                  <div>
                    {omittedValues.map((item, index) => {
                      return <div key={item.key + _.toString(index)}>{item.value}</div>;
                    })}
                  </div>
                }
              >
                <div>+{omittedValues.length}...</div>
              </Tooltip>
            );
          }}
        >
          {allOption && (
            <Select.Option key={'all'} value={'all'}>
              All
            </Select.Option>
          )}
          {_.map(options, (item) => (
            <Select.Option key={item.value} value={item.value} style={{ maxWidth: 500 }}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </InputGroupWithFormItem>
    </div>
  );
}
