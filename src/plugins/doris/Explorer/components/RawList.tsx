import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Space, Table, Popover, Form } from 'antd';
import { CaretDownOutlined, CaretRightOutlined, LeftOutlined, RightOutlined, DownOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

import { NAME_SPACE } from '../../constants';
import { filteredFields } from '../utils';
import LogView from './LogView';
import { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { Link, handleNav } from '@/pages/explorer/components/Links';
interface Props {
  time_field?: string;
  data: {
    [index: string]: string;
  }[];
  options: any;
  onValueFilter?: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
  onReverseChange: (reverse: boolean) => void;
  fieldConfig?: FieldConfigVersion2;
}

interface RenderValueProps {
  name: string;
  value: string;
  onValueFilter?: Props['onValueFilter'];
  fieldConfig?: FieldConfigVersion2;
  rawValue?: object;
  parentKey?: string;
}

export function FieldValueWithFilter({ name, value, onValueFilter, fieldConfig, rawValue }: RenderValueProps) {
  const { t } = useTranslation(NAME_SPACE);
  const form = Form.useFormInstance();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const relatedLinks = fieldConfig?.linkArr?.filter((item) => item.field === name);
  const range = form.getFieldValue(['query', 'range']);
  const parsedRange = range ? parseRange(range) : null;
  let start = parsedRange ? moment(parsedRange.start).unix() : 0;
  let end = parsedRange ? moment(parsedRange.end).unix() : 0;
  return (
    <Popover
      visible={popoverVisible}
      onVisibleChange={(visible) => {
        if (onValueFilter) {
          setPopoverVisible(visible);
        }
      }}
      trigger={['click']}
      overlayClassName='explorer-origin-field-val-popover'
      content={
        <ul className='ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light'>
          <li
            className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
            onClick={() => {
              setPopoverVisible(false);
              onValueFilter?.({
                key: name,
                value,
                operator: 'AND',
              });
            }}
          >
            <Space>
              <PlusCircleOutlined />
              {t('logs.filterAnd')}
            </Space>
          </li>
          <li
            className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
            onClick={() => {
              setPopoverVisible(false);
              onValueFilter?.({
                key: name,
                value,
                operator: 'NOT',
              });
            }}
          >
            <Space>
              <MinusCircleOutlined />
              {t('logs.filterNot')}
            </Space>
          </li>

          {relatedLinks && relatedLinks.length > 0 && <li className='ant-dropdown-menu-item-divider'></li>}
          {relatedLinks?.map((i) => {
            return (
              <li
                className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                style={{ textDecoration: 'underline' }}
                onClick={() => {
                  const valueObjected = Object.entries(rawValue || {}).reduce((acc, [key, value]) => {
                    if (typeof value === 'string') {
                      try {
                        acc[key] = JSON.parse(value);
                      } catch (e) {
                        acc[key] = value;
                      }
                    } else {
                      acc[key] = value;
                    }
                    return acc;
                  }, {});

                  handleNav(i.urlTemplate, valueObjected, { start, end }, fieldConfig?.regExtractArr, fieldConfig?.mappingParamsArr);
                }}
              >
                {i.name}
              </li>
            );
          })}
        </ul>
      }
    >
      {relatedLinks && relatedLinks.length > 0 ? <Link text={value} /> : <div className='explorer-origin-field-val'>{value}</div>}
    </Popover>
  );
}

function RenderValue({ name, value, onValueFilter, fieldConfig, rawValue }: RenderValueProps) {
  const { t } = useTranslation(NAME_SPACE);
  const [expand, setExpand] = useState(false);

  if (typeof value === 'string' && value.indexOf('\n') > -1) {
    const lines = !expand ? _.slice(value.split('\n'), 0, 18) : value.split('\n');
    return (
      <div className='explorer-origin-field-val'>
        {_.map(lines, (v, idx) => {
          return (
            <div key={idx}>
              {v}
              {idx === lines.length - 1 && (
                <a
                  onClick={() => {
                    setExpand(!expand);
                  }}
                  style={{
                    marginLeft: 8,
                  }}
                >
                  {expand ? t('logs.collapse') : t('logs.expand')}
                  {expand ? <LeftOutlined /> : <RightOutlined />}
                </a>
              )}

              <br />
            </div>
          );
        })}
      </div>
    );
  }

  return <FieldValueWithFilter name={name} value={value} onValueFilter={onValueFilter} fieldConfig={fieldConfig} rawValue={rawValue} />;
}

function RenderSubJSON({
  label,
  subJSON,
  options,
  currentExpandLevel,
  onValueFilter,
  fieldConfig,
  rawValue,
}: {
  label: string;
  subJSON: any;
  options: any;
  currentExpandLevel: number;
  onValueFilter?: Props['onValueFilter'];
  fieldConfig?: FieldConfigVersion2;
  rawValue: object;
}) {
  const [expand, setExpand] = useState(currentExpandLevel <= options.jsonExpandLevel);

  useEffect(() => {
    setExpand(currentExpandLevel <= options.jsonExpandLevel);
  }, [options.jsonExpandLevel]);

  if (options.jsonDisplaType === 'tree') {
    return (
      <li className='explorer-origin-li'>
        <div className='explorer-origin-field-subjson'>
          <div
            onClick={() => {
              setExpand(!expand);
            }}
            className='explorer-origin-field-subjson-key'
          >
            {expand ? <CaretDownOutlined /> : <CaretRightOutlined />}
            <span
              className='explorer-origin-field-key'
              style={{
                marginLeft: '2px',
              }}
            >
              {label}
            </span>
          </div>
          <div className='explorer-origin-field-json-symbol'>{`{}`}</div>
        </div>
        {expand && (
          <ul>
            {_.map(subJSON, (v, k) => {
              if (_.isPlainObject(v) || _.isArray(v)) {
                return (
                  <ul className='explorer-origin-ul'>
                    {_.isEmpty(v) ? (
                      <>
                        <div className='explorer-origin-field-key'>{k}</div>:<div className='explorer-origin-field-val'>{`[]`}</div>
                      </>
                    ) : (
                      _.map(_.isArray(v) ? v : [v], (item, idx) => {
                        return (
                          <RenderSubJSON
                            rawValue={rawValue}
                            key={idx}
                            fieldConfig={fieldConfig}
                            label={k}
                            subJSON={item}
                            options={options}
                            currentExpandLevel={currentExpandLevel + 1}
                            onValueFilter={onValueFilter}
                          />
                        );
                      })
                    )}
                  </ul>
                );
              }
              return (
                <li key={k}>
                  <div className='explorer-origin-field-key'>{k}</div>:
                  <RenderValue name={k} value={v} onValueFilter={onValueFilter} fieldConfig={fieldConfig} rawValue={rawValue} />
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }
  if (options.jsonDisplaType === 'string') {
    return (
      <li className='explorer-origin-li'>
        <div className='explorer-origin-field-key'>{label}</div>:<div className='explorer-origin-field-val'>{JSON.stringify(subJSON)}</div>
      </li>
    );
  }
  return null;
}

export default function RawList(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { time_field, data, options, onValueFilter, onReverseChange, fieldConfig } = props;
  const columns: any[] = [
    {
      title: t('logs.title'),
      render: (item) => {
        let fields = filteredFields(_.keys(item), options.organizeFields);
        fields = !_.isEmpty(options.organizeFields) ? _.intersection(fields, options.organizeFields) : fields;

        return (
          <div
            style={{
              flex: 1,
              width: '100%',
            }}
          >
            {_.map(fields, (key) => {
              const val = item[key];
              const valToObj = val;
              const subJSON = _.isArray(valToObj) ? valToObj : [valToObj];
              return (
                <div
                  key={key}
                  className={classNames({
                    'explorer-origin-inline-cell': options.lineBreak !== 'true',
                    'explorer-origin-break-cell': options.lineBreak === 'true',
                  })}
                >
                  {_.isPlainObject(valToObj) || _.isArray(valToObj) ? (
                    <ul className='explorer-origin-ul'>
                      {_.isEmpty(subJSON) ? (
                        <>
                          <div className='explorer-origin-field-key'>{key}</div>: <div className='explorer-origin-field-val'>{`[]`}</div>
                        </>
                      ) : (
                        _.map(_.isArray(valToObj) ? valToObj : [valToObj], (item, idx) => {
                          return (
                            <RenderSubJSON
                              rawValue={item}
                              key={idx}
                              label={key}
                              subJSON={item}
                              options={options}
                              currentExpandLevel={1}
                              onValueFilter={onValueFilter}
                              fieldConfig={fieldConfig}
                            />
                          );
                        })
                      )}
                    </ul>
                  ) : (
                    <>
                      <div className='explorer-origin-field-key'>{key}</div>:{' '}
                      <RenderValue name={key} value={val} onValueFilter={onValueFilter} fieldConfig={fieldConfig} rawValue={item} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      },
    },
  ];

  if (time_field && options.time === 'true') {
    columns.unshift({
      title: t('logs.settings.time'),
      width: 140,
      dataIndex: time_field,
      key: 'time',
      render: (val) => {
        return moment(val).format('MM-DD HH:mm:ss.SSS');
      },
      defaultSortOrder: 'descend',
      sortDirections: ['ascend', 'descend', 'ascend'],
      sorter: true,
    });
  }
  if (options.lines === 'true') {
    columns.unshift({
      title: t('logs.settings.lines'),
      width: 50,
      render: (_record, _row, index) => {
        return index + 1;
      },
    });
  }

  return (
    <Table
      rowKey='___id___'
      size='small'
      pagination={false}
      expandable={{
        expandedRowRender: (record) => {
          return <LogView value={record} onValueFilter={onValueFilter} fieldConfig={fieldConfig} rawValue={record} />;
        },
        expandIcon: ({ expanded, onExpand, record }) => (expanded ? <DownOutlined onClick={(e) => onExpand(record, e)} /> : <RightOutlined onClick={(e) => onExpand(record, e)} />),
      }}
      scroll={{ y: 'calc(100% - 40px)' }}
      onChange={(pagination, filters, sorter: any, extra) => {
        if (sorter.columnKey === 'time') {
          onReverseChange(sorter.order !== 'ascend');
        }
      }}
      dataSource={data}
      columns={columns}
    />
  );
}
