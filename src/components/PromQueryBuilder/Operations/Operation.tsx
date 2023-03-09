import React from 'react';
import { Button, Col, Row, Select, Input, InputNumber, Switch } from 'antd';
import { CloseCircleOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import { PromVisualQuery, PromVisualQueryOperation, VisualQueryOperationParamValue, QueryBuilderOperationParamDef, QueryBuilderOperationDef } from '../types';
import { getOperationDefinitions } from './utils';
import LabelNameSelect from '../LabelFilters/LabelNameSelect';

interface IProps {
  metric?: string;
  datasourceValue: number;
  params: {
    start: number;
    end: number;
  };
  query: PromVisualQuery;
  onChange: (query: PromVisualQuery) => void;
  operation: PromVisualQueryOperation;
  index: number;
}

const SortableItem = SortableElement(({ children }) => <div>{children}</div>);
const DragHandle = SortableHandle(({ children }) => <div className='prom-query-builder-operation-handler'>{children}</div>);
function renderOperationParamEditor(
  paramDef: QueryBuilderOperationParamDef,
  paramEditorProps: any,
  value: VisualQueryOperationParamValue,
  onChange: (val: VisualQueryOperationParamValue) => void,
): React.ReactNode {
  if (paramDef.subType === 'labelNameSelect') {
    return (
      <LabelNameSelect
        size='small'
        {...paramEditorProps}
        style={{ width: '100%', minWidth: 100 }}
        value={value}
        onChange={(val) => {
          onChange(val);
        }}
      />
    );
  }

  if (paramDef.options) {
    return (
      <Select
        size='small'
        style={{ width: '100%' }}
        value={value as string | number}
        onChange={(val) => {
          onChange(val);
        }}
      >
        {_.map(paramDef.options, (option: any) => {
          return (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          );
        })}
      </Select>
    );
  }

  switch (paramDef.type) {
    case 'boolean':
      return (
        <Switch
          size='small'
          checked={value as boolean}
          onChange={(checked) => {
            onChange(checked);
          }}
        />
      );
    case 'number':
      return (
        <InputNumber
          style={{ width: '100%' }}
          size='small'
          value={value as number}
          onChange={(val) => {
            onChange(val);
          }}
        />
      );
    case 'string':
    default:
      return (
        <Input
          size='small'
          value={value as string}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      );
  }
}

export default function Operation(props: IProps) {
  const { metric, datasourceValue, params, query, onChange, operation, index } = props;
  const { operations } = query;
  const addOperationOptions = getOperationDefinitions();
  const operationDef = _.find(addOperationOptions, { id: operation.id })!;
  const operationElements: React.ReactNode[] = [];

  for (let paramIndex = 0; paramIndex < operation.params.length; paramIndex++) {
    const paramDef = operationDef.params[Math.min(operationDef.params.length - 1, paramIndex)];

    operationElements.push(
      <div key={paramIndex - 1} className='prom-query-builder-operation-param'>
        {!paramDef.hideName && <div className='prom-query-builder-operation-param-label'>{paramDef.name}</div>}
        <div className='prom-query-builder-operation-param-value'>
          <Row gutter={8}>
            <Col flex='auto'>
              {renderOperationParamEditor(
                paramDef,
                {
                  metric,
                  datasourceValue,
                  params,
                  labels: query.labels,
                },
                _.get(operation, `params[${paramIndex}]`),
                (val) => {
                  const newOperations = _.cloneDeep(operations);
                  let newOperation = {
                    ...operation,
                    params: [...operation.params.slice(0, paramIndex), val, ...operation.params.slice(paramIndex + 1)],
                  };
                  if (operationDef.paramChangedHandler) {
                    newOperation = operationDef.paramChangedHandler(index, newOperation, operationDef);
                  }
                  newOperations[index] = newOperation;
                  onChange({
                    ...query,
                    operations: newOperations,
                  });
                },
              )}
            </Col>
            {paramDef.restParam && (operation.params.length > operationDef.params.length || paramDef.optional) && (
              <Col flex='24px'>
                <Button
                  size='small'
                  icon={<CloseOutlined />}
                  title={`Remove ${paramDef.name}`}
                  onClick={() => {
                    let newOperation = {
                      ...operation,
                      params: [...operation.params.slice(0, paramIndex), ...operation.params.slice(paramIndex + 1)],
                    };
                    if (operationDef.paramChangedHandler) {
                      newOperation = operationDef.paramChangedHandler(index, newOperation, operationDef);
                    }
                    const newOperations = _.cloneDeep(operations);
                    newOperations[index] = newOperation;
                    onChange({
                      ...query,
                      operations: newOperations,
                    });
                  }}
                />
              </Col>
            )}
          </Row>
        </div>
      </div>,
    );
  }

  let restParam: React.ReactNode | undefined;
  if (operationDef.params.length > 0) {
    const lastParamDef = operationDef.params[operationDef.params.length - 1];
    if (lastParamDef.restParam) {
      restParam = (
        <Button
          size='small'
          icon={<PlusOutlined />}
          onClick={() => {
            let newOperation = { ...operation, params: [...operation.params, ''] };
            if (operationDef.paramChangedHandler) {
              newOperation = operationDef.paramChangedHandler(operation.params.length, newOperation, operationDef);
            }
            const newOperations = _.cloneDeep(operations);
            newOperations[index] = newOperation;
            onChange({
              ...query,
              operations: newOperations,
            });
          }}
        >
          {lastParamDef.name}
        </Button>
      );
    }
  }

  if (!operationDef) {
    return null;
  }
  return (
    <SortableItem key={operation.id} index={index}>
      <div className='prom-query-builder-operation'>
        <div className='prom-query-builder-operation-header'>
          <DragHandle>{operationDef.name}</DragHandle>
          <CloseCircleOutlined
            onClick={() => {
              onChange({
                ...query,
                operations: _.filter(operations, (o) => o.id !== operation.id),
              });
            }}
          />
        </div>
        <div className='prom-query-builder-operation-content'>
          {operationElements}
          {restParam}
          {_.isEmpty(operationDef.params) && <div>无参数</div>}
        </div>
      </div>
    </SortableItem>
  );
}
