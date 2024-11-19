import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import { Select, Form, Spin } from 'antd';
import { useDebounceFn } from 'ahooks';
import { CommonStateContext } from '@/App';

// @ts-ignore
import { getNetworkDevices, getNetworkDevicesTags } from 'plus:/pages/networkDevices/services';

interface IProps {
  queryKey: string;
  queryOp: string;
  field: any;
}

export default function ValuesSelect(props: IProps) {
  const { queryKey, queryOp, field } = props;
  const { busiGroups } = useContext(CommonStateContext);
  const [options, setOptions] = useState<any[]>([]);
  const [fetching, setFetching] = useState<boolean>(false);
  const { run: fetchNetworkDevices } = useDebounceFn(
    (query?: string) => {
      setFetching(true);
      getNetworkDevices({
        p: 1,
        limit: 100,
        query,
      })
        .then((res) => {
          setOptions(
            _.map(res?.list || [], (item) => {
              return {
                id: item.ip,
                name: item.ip,
              };
            }),
          );
        })
        .finally(() => {
          setFetching(false);
        });
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    if (queryKey === 'group_ids') {
      setOptions(
        _.map(busiGroups, (item) => {
          return {
            id: item.id,
            name: item.name,
          };
        }),
      );
    } else if (queryKey === 'ips') {
      fetchNetworkDevices();
    } else if (queryKey === 'tags') {
      getNetworkDevicesTags(undefined).then((res) => {
        setOptions(
          _.map(res?.dat || [], (item) => {
            return {
              id: item,
              name: item,
            };
          }),
        );
      });
    }
  }, [queryKey]);

  return (
    <Form.Item {...field} name={[field.name, 'values']} fieldKey={[field.fieldKey, 'values']} rules={[{ required: true, message: 'Missing value' }]}>
      {queryKey !== 'ips' ? (
        <Select
          mode='multiple'
          style={{ minWidth: 200, maxWidth: 600 }}
          optionFilterProp='label'
          options={_.map(options, (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          })}
        />
      ) : (
        <Select
          mode={queryOp === '=~' || queryOp === '!~' ? 'tags' : 'multiple'}
          style={{ minWidth: 200, maxWidth: 600 }}
          filterOption={false}
          onSearch={(val) => {
            fetchNetworkDevices(val);
          }}
          options={_.map(options, (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          })}
          onDropdownVisibleChange={(open) => {
            if (open) {
              fetchNetworkDevices();
            } else {
              setOptions([]);
            }
          }}
          notFoundContent={fetching ? <Spin size='small' /> : null}
        />
      )}
    </Form.Item>
  );
}
