import React, { useState, useContext, useMemo } from 'react';
import { Popover, Space, Tooltip } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, CopyOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { copy2ClipBoard } from '@/utils';
import IconFont from '@/components/IconFont';
import { Link, handleNav } from '@/pages/explorer/components/Links';
import { parseRange } from '@/components/TimeRangePicker';
import ExistsIcon from '@/pages/explorer/components/RenderValue/ExistsIcon';

import { toString } from './util';
import { LogsViewerStateContext } from '../../index';
import { Field } from '../../../../types';
import { NAME_SPACE } from '../../../../constants';
import { OnValueFilterParams } from '../../types';

interface Props {
  segmented: boolean;
  parentKey?: string; // 嵌套json渲染时可以传入，目前仅用在下钻的字段名判断中。目前仅在 sls 中使用
  name: string;
  value: string; // 单个 token 的值
  fieldValue: string; // 完整字段值
  onTokenClick?: (parmas: OnValueFilterParams) => void;
  rawValue?: { [key: string]: any };
  highlight?: { [key: string]: string[] };
  enableTooltip?: boolean;
  fieldValueClassName?: string;
  adjustFieldValue?: (formatedValue: string, highlightValue?: string[]) => React.ReactNode;
  showExistsAction?: boolean; // 是否展示 exists 操作，目前仅在 es 中使用
}

export default function Token(props: Props) {
  const { indexData, getAddToQueryInfo } = useContext(LogsViewerStateContext);

  if (getAddToQueryInfo && (!indexData || _.isEmpty(indexData))) return null;
  return <TokenWithContext {...props} indexData={indexData || []} />;
}

function TokenWithContext(props: Props & { indexData: Field[] }) {
  const { t } = useTranslation(NAME_SPACE);
  const { raw_key, fieldConfig, range, getAddToQueryInfo } = useContext(LogsViewerStateContext);

  const { segmented, parentKey, name, value, fieldValue, onTokenClick, rawValue, highlight, enableTooltip, fieldValueClassName, indexData, adjustFieldValue, showExistsAction } =
    props;

  const [popoverVisible, setPopoverVisible] = useState(false);
  const relatedLinks = fieldConfig?.linkArr?.filter((item) => (parentKey ? item.field === parentKey : item.field === name));

  const parsedRange = range ? parseRange(range) : null;
  let start = parsedRange ? moment(parsedRange.start).unix() : 0;
  let end = parsedRange ? moment(parsedRange.end).unix() : 0;

  const indexInfo = getAddToQueryInfo
    ? useMemo(() => {
        return getAddToQueryInfo({
          parentKey,
          fieldName: name,
          logRowData: rawValue || {},
          indexData,
        });
      }, [name, JSON.stringify(rawValue?.[raw_key]), JSON.stringify(indexData)])
    : {
        isIndex: true,
        indexName: name,
      };

  // ES 数据源的自定义格式化
  let displayValue = toString(value);
  const fieldAttr = fieldConfig?.arr?.find((i) => i.field === name);
  if (fieldAttr?.formatMap?.type === 'date' && fieldAttr?.formatMap?.params?.pattern) {
    displayValue = moment(fieldValue).format(fieldAttr?.formatMap?.params?.pattern);
  }
  if (fieldAttr?.formatMap?.type === 'url' && fieldAttr?.formatMap?.params?.urlTemplate) {
    displayValue = fieldAttr?.formatMap?.params?.labelTemplate.replace('{{value}}', fieldValue);
  }

  // 可通过 adjustFieldValue 再加工一次
  const adjustedValue = adjustFieldValue ? adjustFieldValue(displayValue, highlight?.[name]) : displayValue;

  return (
    <Popover
      visible={popoverVisible}
      onVisibleChange={(visible) => {
        if (onTokenClick) {
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
              copy2ClipBoard(`${name}:${fieldValue}`);
            }}
          >
            <Space>
              <CopyOutlined />
              {t('common:btn.copy')}
            </Space>
          </li>
          {indexInfo.isIndex && (
            <>
              {segmented && (
                <>
                  <li
                    className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                    onClick={() => {
                      setPopoverVisible(false);
                      onTokenClick?.({
                        key: name,
                        value,
                        assignmentOperator: ':',
                        operator: 'AND',
                        indexName: indexInfo.indexName,
                      });
                    }}
                  >
                    <Space>
                      <PlusCircleOutlined />
                      {t('logs.filterAnd', {
                        token: toString(value),
                      })}
                    </Space>
                  </li>
                  <li
                    className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                    onClick={() => {
                      setPopoverVisible(false);
                      onTokenClick?.({
                        key: name,
                        value,
                        assignmentOperator: ':',
                        operator: 'NOT',
                        indexName: indexInfo.indexName,
                      });
                    }}
                  >
                    <Space>
                      <MinusCircleOutlined />
                      {t('logs.filterNot', {
                        token: toString(value),
                      })}
                    </Space>
                  </li>
                </>
              )}
              <li
                className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                onClick={() => {
                  setPopoverVisible(false);
                  onTokenClick?.({
                    key: name,
                    value: fieldValue,
                    assignmentOperator: '=',
                    operator: 'AND',
                    indexName: indexInfo.indexName,
                  });
                }}
              >
                <Space>
                  <PlusCircleOutlined />
                  {t('logs.filterAllAnd')}
                </Space>
              </li>
              <li
                className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                onClick={() => {
                  setPopoverVisible(false);
                  onTokenClick?.({
                    key: name,
                    value: fieldValue,
                    assignmentOperator: '=',
                    operator: 'NOT',
                    indexName: indexInfo.indexName,
                  });
                }}
              >
                <Space>
                  <MinusCircleOutlined />
                  {t('logs.filterAllNot')}
                </Space>
              </li>
              {showExistsAction && (
                <li
                  className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                  onClick={() => {
                    setPopoverVisible(false);
                    onTokenClick?.({
                      key: name,
                      value: fieldValue,
                      assignmentOperator: '=',
                      operator: 'EXISTS',
                      indexName: indexInfo.indexName,
                    });
                  }}
                >
                  <Space>
                    <ExistsIcon />
                    {t('logs.filterExists')}
                  </Space>
                </li>
              )}
            </>
          )}

          {relatedLinks && relatedLinks.length > 0 && <li className='ant-dropdown-menu-item-divider'></li>}
          {relatedLinks?.map((i) => {
            return (
              <li
                key={i}
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
                <span style={{ background: 'var(--fc-fill-4)', marginLeft: 6, display: 'inline-flex', padding: 3, borderRadius: 2 }}>
                  <IconFont type='icon-ic_arrow_right' style={{ color: 'var(--fc-fill-primary)', height: 12 }} />
                </span>
              </li>
            );
          })}
        </ul>
      }
    >
      <Tooltip
        title={enableTooltip ? <pre className='whitespace-pre-wrap overflow-hidden mb-0 ant-tooltip-max-height-400 overflow-y-auto'>{adjustedValue}</pre> : undefined}
        placement='topLeft'
        overlayClassName='ant-tooltip-max-width-600'
      >
        {relatedLinks && relatedLinks.length > 0 ? (
          <Link
            text={adjustedValue}
            linkContext={{
              rawValue: rawValue!,
              name,
              fieldConfig,
              range,
              parentKey,
            }}
          />
        ) : (
          <div className={`inline text-hint m-0 p-0 cursor-pointer hover:underline ${fieldValueClassName ?? ''}`}>{adjustedValue}</div>
        )}
      </Tooltip>
    </Popover>
  );
}
