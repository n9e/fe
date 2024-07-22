import React from 'react';
import _ from 'lodash';
import purify from 'dompurify';
import { getFieldLabel, getFieldValue, RenderValue } from './index';
import { getHighlightHtml } from './highlight';

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

export function getColumnsFromFields(selectedFields: { name: string; type: string }[], queryValue: any, fieldConfig?: any) {
  const { date_field: dateField } = queryValue;
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
              {_.map(fieldKeys, (key) => {
                const val = fields[key];
                const label = getFieldLabel(key, fieldConfig);
                if (!_.isPlainObject(val) && fieldConfig?.formatMap?.[key]) {
                  const value = getFieldValue(key, val, fieldConfig);
                  return (
                    <React.Fragment key={label}>
                      <dt>{label}:</dt> <dd>{value}</dd>
                    </React.Fragment>
                  );
                }
                return (
                  <React.Fragment key={label}>
                    <dt>{label}:</dt> <dd dangerouslySetInnerHTML={{ __html: purify.sanitize(getHighlightHtml(val, highlight?.[key])) }}></dd>
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
          const fieldVal = getFieldValue(item.name, fields[fieldKey], fieldConfig);
          const value = _.isArray(fieldVal) ? _.join(fieldVal, ',') : fieldVal;
          return <RenderValue value={value} highlights={highlight?.[fieldKey]} />;
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
      render: (fields) => {
        const format = fieldConfig?.formatMap?.[dateField];
        return getFieldValue(dateField, fields[dateField], {
          formatMap: {
            [dateField]: {
              type: 'date',
              params: {
                pattern: format?.params?.pattern || 'YYYY-MM-DD HH:mm:ss',
              },
            },
          },
        });
      },
      defaultSortOrder: 'descend',
      sorter: {
        multiple: 1,
      },
    });
  }
  return columns;
}
