import React from 'react';
import { Select, Input, Space } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import PromQueryBuilder from '../index';
import { PromVisualQueryBinary, PromVisualQuery } from '../types';

interface IProps {
  nestedQuery: PromVisualQueryBinary<PromVisualQuery>;
  datasourceValue: number;
  params: {
    start: number;
    end: number;
  };
  index: number;
  onChange: (index: number, update: PromVisualQueryBinary<PromVisualQuery>) => void;
  onRemove: (index: number) => void;
}

const operators = ['+', '-', '*', '/', '%', '^', '==', '!=', '<', '<=', '>', '>='];

export default function NestedQuery(props: IProps) {
  const { nestedQuery, datasourceValue, params, index, onChange, onRemove } = props;

  return (
    <div>
      <Space>
        <div>Operator</div>
        <Select
          style={{ minWidth: 60 }}
          value={nestedQuery.operator}
          onChange={(value) => {
            onChange(index, {
              ...nestedQuery,
              operator: value,
            });
          }}
        >
          {_.map(operators, (operator) => {
            return (
              <Select.Option key={operator} value={operator}>
                {operator}
              </Select.Option>
            );
          })}
        </Select>
        <div>Vector matches</div>
        <Space>
          <Select
            style={{ minWidth: 60 }}
            value={nestedQuery.vectorMatchesType || 'on'}
            onChange={(value) => {
              onChange(index, {
                ...nestedQuery,
                vectorMatchesType: value,
              });
            }}
          >
            <Select.Option value='on'>on</Select.Option>
            <Select.Option value='ignoring'>ignoring</Select.Option>
          </Select>
          <Input
            style={{ minWidth: 60 }}
            value={nestedQuery.vectorMatches}
            onChange={(e) => {
              onChange(index, {
                ...nestedQuery,
                vectorMatches: e.target.value,
                vectorMatchesType: nestedQuery.vectorMatchesType || 'on',
              });
            }}
          />
        </Space>
        <CloseCircleOutlined onClick={() => onRemove(index)} />
      </Space>
      <div>
        <PromQueryBuilder
          rawQueryOpen={false}
          datasourceValue={datasourceValue}
          params={params}
          value={nestedQuery.query}
          onChange={(update) => {
            onChange(index, { ...nestedQuery, query: update });
          }}
        />
      </div>
    </div>
  );
}
