import React from 'react';
import _ from 'lodash';
import PromQLInput from '@/components/PromQLInput';
import { PromVisualQuery, PromVisualQueryOperation, PromVisualQueryBinary, PromVisualQueryLabelFilter } from '../types';
import { getOperationDefinitions } from '../Operations/utils';

function hasBinaryOp(query: PromVisualQuery): boolean {
  return (
    query.operations.find((op) => {
      const addOperationOptions = getOperationDefinitions();
      const def = _.find(addOperationOptions, { id: op.id });
      return def?.category === 'Binary operations';
    }) !== undefined
  );
}

function renderOperations(queryString: string, operations: PromVisualQueryOperation[]) {
  const addOperationOptions = getOperationDefinitions();
  for (const operation of operations) {
    const operationDef = _.find(addOperationOptions, { id: operation.id });
    if (!operationDef) {
      throw new Error(`Could not find operation ${operation.id} in the registry`);
    }
    queryString = operationDef.renderer(operation, operationDef, queryString);
  }

  return queryString;
}

function renderBinaryQueries(queryString: string, binaryQueries?: Array<PromVisualQueryBinary<PromVisualQuery>>) {
  if (binaryQueries) {
    for (const binQuery of binaryQueries) {
      queryString = `${renderBinaryQuery(queryString, binQuery)}`;
    }
  }
  return queryString;
}

function renderBinaryQuery(leftOperand: string, binaryQuery: PromVisualQueryBinary<PromVisualQuery>) {
  let result = leftOperand + ` ${binaryQuery.operator} `;

  if (binaryQuery.vectorMatches) {
    result += `${binaryQuery.vectorMatchesType}(${binaryQuery.vectorMatches}) `;
  }

  return result + renderQuery(binaryQuery.query, true);
}

function renderLabels(labels: PromVisualQueryLabelFilter[]) {
  const filteredLabels = _.filter(labels, (label) => {
    return !!label.label && !!label.value;
  });
  if (filteredLabels.length === 0) {
    return '';
  }

  let expr = '{';
  for (const filter of filteredLabels) {
    if (expr !== '{') {
      expr += ', ';
    }

    expr += `${filter.label}${filter.op}"${filter.value}"`;
  }

  return expr + `}`;
}

export function renderQuery(query: PromVisualQuery, nested?: boolean) {
  let queryString = `${query.metric ?? ''}${renderLabels(query.labels)}`;
  queryString = renderOperations(queryString, query.operations);

  if (!nested && hasBinaryOp(query) && Boolean(query.binaryQueries?.length)) {
    queryString = `(${queryString})`;
  }

  queryString = renderBinaryQueries(queryString, query.binaryQueries);

  if (nested && (hasBinaryOp(query) || Boolean(query.binaryQueries?.length))) {
    queryString = `(${queryString})`;
  }

  return queryString;
}

export default function index(props: { query: PromVisualQuery; datasourceValue: number }) {
  const promql = renderQuery(props.query);
  if (!promql) return null;
  return (
    <div className='prom-query-builder-rawquery-container'>
      <PromQLInput value={promql} datasourceValue={props.datasourceValue} readonly />
    </div>
  );
}
