import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import { Select, Form, Spin, AutoComplete } from 'antd';
import { useDebounceFn } from 'ahooks';
import { CommonStateContext } from '@/App';
import { getBusiGroups } from '@/services/common';
import { getTargetTags, getMonObjectList } from '@/services/targets';

interface IProps {
  queryKey: string;
  queryOp: string;
  field: any;
}

export default function ValuesSelect(props: IProps) {
  const { queryKey, queryOp, field } = props;
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const datasourceList = _.reduce(
    groupedDatasourceList,
    (result, value) => {
      return _.concat(result, value);
    },
    [],
  );
  const [options, setOptions] = useState<any[]>([]);
  const [fetching, setFetching] = useState<boolean>(false);
  const { run: fetchHosts } = useDebounceFn(
    (query?: string) => {
      setFetching(true);
      getMonObjectList({
        p: 1,
        limit: 100,
        bgid: -1,
        query,
      })
        .then((res) => {
          setOptions(
            _.map(res?.dat?.list || [], (item) => {
              return {
                id: item.ident,
                name: item.ident,
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
      fetchHosts();
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
      {queryKey !== 'hosts' ? (
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
            fetchHosts(val);
          }}
          options={_.map(options, (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          })}
          onDropdownVisibleChange={(open) => {
            if (open) {
              fetchHosts();
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
