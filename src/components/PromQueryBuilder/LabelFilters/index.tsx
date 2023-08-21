import React, { useEffect } from 'react';
import { Select, Input, Button, Space } from 'antd';
import { PlusCircleOutlined, CloseOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useDynamicList } from 'ahooks';
import { useTranslation } from 'react-i18next';
import FormItem from '../components/FormItem';
import LabelNameSelect from './LabelNameSelect';
import LabelValueSelect from './LabelValueSelect';
import { PromVisualQueryLabelFilter } from '../types';

interface IProps {
  datasourceValue: number;
  metric?: string;
  params: {
    start: number;
    end: number;
  };
  value: PromVisualQueryLabelFilter[];
  onChange: (val: PromVisualQueryLabelFilter[]) => void;
}

export default function index(props: IProps) {
  const { t } = useTranslation('PromQueryBuilder');
  const { datasourceValue, metric, params, value, onChange } = props;
  const { list, remove, getKey, insert, replace } = useDynamicList(
    value || [
      {
        label: '',
        value: '',
        op: '=',
      },
    ],
  );

  useEffect(() => {
    onChange(list);
  }, [list]);

  return (
    <>
      <FormItem
        label={
          <Space>
            {t('labelFilter')}
            <PlusCircleOutlined
              onClick={() => {
                insert(list.length, {
                  label: '',
                  value: '',
                  op: '=',
                });
              }}
            />
          </Space>
        }
        style={{ width: list.length > 1 ? '100%' : 'calc(50% - 4px)' }}
      >
        <div className='prom-query-builder-labels-container'>
          {_.map(list, (item, index) => {
            return (
              <Input.Group
                compact
                key={getKey(index)}
                style={{
                  width: list.length > 1 ? 'calc(50% - 4px)' : '100%',
                }}
              >
                <LabelNameSelect
                  style={{ width: '30%' }}
                  metric={metric}
                  labels={list}
                  datasourceValue={datasourceValue}
                  params={params}
                  value={item.label}
                  onChange={(val) => {
                    replace(index, {
                      ...item,
                      label: val,
                    });
                  }}
                />
                <Select
                  style={{ width: 60 }}
                  value={item.op}
                  onChange={(val) => {
                    replace(index, {
                      ...item,
                      op: val,
                    });
                  }}
                >
                  <Select.Option value='='>=</Select.Option>
                  <Select.Option value='!='>!=</Select.Option>
                  <Select.Option value='=~'>=~</Select.Option>
                  <Select.Option value='!~'>!~</Select.Option>
                </Select>
                <LabelValueSelect
                  label={item.label}
                  datasourceValue={datasourceValue}
                  params={params}
                  style={{
                    width: `calc(100% - 30% - 60px - 32px)`,
                  }}
                  value={item.value}
                  onChange={(val) => {
                    replace(index, {
                      ...item,
                      value: val,
                    });
                  }}
                />
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => {
                    remove(index);
                  }}
                />
              </Input.Group>
            );
          })}
        </div>
      </FormItem>
    </>
  );
}
