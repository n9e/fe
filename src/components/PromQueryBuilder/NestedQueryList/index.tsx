import React from 'react';
import _ from 'lodash';
import { PromVisualQueryBinary, PromVisualQuery } from '../types';
import NestedQuery from './NestedQuery';

interface IProps {
  datasourceValue: number;
  params: {
    start: number;
    end: number;
  };
  value: PromVisualQuery['binaryQueries'];
  onChange: (value: PromVisualQuery['binaryQueries']) => void;
}

export default function index(props: IProps) {
  const { datasourceValue, params, onChange } = props;
  const value = props.value ?? [];

  const onNestedQueryUpdate = (index: number, update: PromVisualQueryBinary<PromVisualQuery>) => {
    const updatedList = [...value];
    updatedList.splice(index, 1, update);
    onChange(updatedList);
  };

  const onRemove = (index: number) => {
    const updatedList = [...value.slice(0, index), ...value.slice(index + 1)];
    onChange(updatedList);
  };

  return (
    <div>
      {_.map(value, (item, index) => {
        return (
          <NestedQuery
            key={index.toString()}
            params={params}
            nestedQuery={item}
            index={index}
            onChange={onNestedQueryUpdate}
            datasourceValue={datasourceValue}
            onRemove={onRemove}
          />
        );
      })}
    </div>
  );
}
