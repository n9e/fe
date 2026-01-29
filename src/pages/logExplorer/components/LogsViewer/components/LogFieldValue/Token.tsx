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
  enableTooltip?: boolean;
  fieldValueClassName?: string;
}

export default function Token(props: Props) {
  const { indexData, getAddToQueryInfo } = useContext(LogsViewerStateContext);

  if (getAddToQueryInfo && (!indexData || _.isEmpty(indexData))) return null;
  return <TokenWithContext {...props} indexData={indexData || []} />;
}

function TokenWithContext(props: Props & { indexData: Field[] }) {
  const { t } = useTranslation(NAME_SPACE);
  const { raw_key, fieldConfig, range, getAddToQueryInfo } = useContext(LogsViewerStateContext);

  const { segmented, parentKey, name, value, fieldValue, onTokenClick, rawValue, enableTooltip, fieldValueClassName, indexData } = props;

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
        title={enableTooltip ? <pre className='whitespace-pre-wrap overflow-hidden mb-0 ant-tooltip-max-height-400 overflow-y-auto'>{toString(value)}</pre> : undefined}
        placement='topLeft'
        overlayClassName='ant-tooltip-max-width-600'
      >
        {relatedLinks && relatedLinks.length > 0 ? (
          <Link
            text={toString(value)}
            linkContext={{
              rawValue: rawValue!,
              name,
              fieldConfig,
              range,
              parentKey,
            }}
          />
        ) : (
          <div className={`inline text-hint m-0 p-0 cursor-pointer hover:underline ${fieldValueClassName ?? ''}`}>{toString(value)}</div>
        )}
      </Tooltip>
    </Popover>
  );
}
