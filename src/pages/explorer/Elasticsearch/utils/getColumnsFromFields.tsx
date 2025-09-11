import React from 'react';
import _ from 'lodash';
import purify from 'dompurify';
import { getFieldLabel } from './index';
import { getHighlightHtml } from './highlight';
import RenderValue from '@/pages/explorer/components/RenderValue';

export const typeMap: Record<string, string> = {
  float: 'number',
  double: 'number',
  integer: 'number',
  long: 'number',
  date: 'date',
  date_nanos: 'date',
  string: 'string',
  text: 'string',
  scaled_float: 'number',
  nested: 'nested',
  histogram: 'number',
  boolean: 'boolean',
};

function localeCompareFunc(a, b) {
  return a.localeCompare(b);
}

export function getColumnsFromFields(
  selectedFields: { name: string; type: string }[],
  queryValue: any,
  fieldConfig?: any,
  onActionClick?: (params: { key: string; value?: string; operator: string }) => void,
) {
  const { date_field: dateField, range } = queryValue;
  let columns: any[] = [];
  if (_.isEmpty(selectedFields)) {
    columns = [
      {
        title: 'Document',
        dataIndex: 'fields',
        render(text, record) {
          const { highlight } = record;
          const fields = _.cloneDeep(text);
          _.forEach(fields, (value, key) => {
            if (value === undefined || value === null || value === '') {
              delete fields[key];
            }
          });
          const fieldKeys = _.sortBy(_.keys(fields), (key) => {
            const highlightKeys = _.keys(highlight);
            return _.includes(highlightKeys, key) ? _.indexOf(highlightKeys, key) : highlightKeys.length + 1;
          });

          return (
            <dl className='es-discover-logs-row'>
              {/*2024-0807 限制只渲染前 20 个字段*/}
              {_.map(_.slice(fieldKeys, 0, 20), (key) => {
                const val = fields[key];
                const label = getFieldLabel(key, fieldConfig);
                return (
                  <React.Fragment key={label}>
                    <dt>{label}:</dt>{' '}
                    <dd>
                      <RenderValue
                        fieldKey={key}
                        fieldValue={val}
                        fieldConfig={fieldConfig}
                        rawValue={record.json}
                        range={range}
                        adjustFieldValue={(formatedValue) => {
                          if (highlight?.[key]) {
                            return <span dangerouslySetInnerHTML={{ __html: purify.sanitize(getHighlightHtml(formatedValue, highlight[key])) }} />;
                          }
                          return formatedValue;
                        }}
                        onActionClick={onActionClick}
                      />
                    </dd>
                  </React.Fragment>
                );
              })}
            </dl>
          );
        },
      },
    ];
  } else {
    columns = _.map(selectedFields, (item, idx) => {
      const fieldKey = item.name;
      const label: string = getFieldLabel(fieldKey, fieldConfig);
      return {
        title: label,
        dataIndex: 'fields',
        key: fieldKey,
        render: (fields, record) => {
          const { highlight } = record;
          return (
            <RenderValue
              fieldKey={item.name}
              fieldValue={fields[item.name]}
              fieldConfig={fieldConfig}
              rawValue={record.json}
              range={range}
              adjustFieldValue={(formatedValue) => {
                if (highlight?.[item.name]) {
                  return <span dangerouslySetInnerHTML={{ __html: purify.sanitize(getHighlightHtml(formatedValue, highlight[item.name])) }} />;
                }
                return formatedValue;
              }}
              onActionClick={onActionClick}
            />
          );
        },
        sorter: _.includes(['date', 'number'], typeMap[item.type])
          ? {
              multiple: idx + 2,
              compare: (a, b) => localeCompareFunc(_.join(_.get(a, `fields[${item}]`, '')), _.join(_.get(b, `fields[${item}]`, ''))),
            }
          : false,
      };
    });
  }
  if (dateField) {
    columns.unshift({
      title: 'Time',
      dataIndex: 'fields',
      key: dateField,
      width: 200,
      render: (fields, record) => {
        return <RenderValue fieldKey={dateField} fieldValue={fields[dateField]} fieldConfig={fieldConfig} rawValue={record.json} range={range} onActionClick={onActionClick} />;
      },
      defaultSortOrder: 'descend',
      sorter: {
        multiple: 1,
      },
    });
  }
  return columns;
}
