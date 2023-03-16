import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import { Select, Form } from 'antd';
import { CommonStateContext } from '@/App';
import { getBusiGroups } from '@/services/common';
import { getTargetTags, getMonObjectList } from '@/services/targets';

interface IProps {
  queryKey: string;
  field: any;
}

export default function ValuesSelect(props: IProps) {
  const { queryKey, field } = props;
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const datasourceList = _.reduce(
    groupedDatasourceList,
    (result, value) => {
      return _.concat(result, value);
    },
    [],
  );
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    if (queryKey === 'group_ids') {
      getBusiGroups().then((res) => {
        setOptions(
          _.map(res?.dat || [], (item) => {
            return {
              id: item.id,
              name: item.name,
            };
          }),
        );
      });
    } else if (queryKey === 'hosts') {
      getMonObjectList({
        p: 1,
        limit: 500,
        bgid: -1,
      }).then((res) => {
        setOptions(
          _.map(res?.dat?.list || [], (item) => {
            return {
              id: item.ident,
              name: item.ident,
            };
          }),
        );
      });
    } else if (queryKey === 'tags' || queryKey === 'hosts') {
      getTargetTags(undefined).then((res) => {
        setOptions(
          _.map(res?.dat || [], (item) => {
            return {
              id: item,
              name: item,
            };
          }),
        );
      });
    } else if (queryKey === 'datasource_ids') {
      setOptions(
        _.map(datasourceList, (item) => {
          return {
            id: item.id,
            name: item.name,
          };
        }),
      );
    }
  }, [queryKey]);

  return (
    <Form.Item {...field} name={[field.name, 'values']} fieldKey={[field.fieldKey, 'values']} rules={[{ required: true, message: 'Missing value' }]}>
      <Select mode='multiple' style={{ minWidth: 200, maxWidth: 600 }}>
        {_.map(options, (item) => {
          return (
            <Select.Option key={item.id} value={item.id}>
              {item.name}
            </Select.Option>
          );
        })}
      </Select>
    </Form.Item>
  );
}
