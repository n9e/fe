/**
 * 带添加检索条件功能的字段值展示组件
 */

import React, { useState, useMemo, useContext } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Space, Popover } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { Field } from '@/pages/explorer/components/FieldsList/types';

import { copy2ClipBoard } from '@/utils';
import { parseRange } from '@/components/TimeRangePicker';
import { Link, handleNav } from '@/pages/explorer/components/Links';

import { LogsViewerStateContext } from '../index';

interface RenderValueProps {
  name: string;
  value: string;
  onValueFilter?: (parmas: { key: string; value: string; operator: 'AND' | 'NOT'; indexName: string }) => void;
  rawValue?: { [key: string]: any };
}

export default function FieldValueWithFilter({ name, value, onValueFilter, rawValue }: RenderValueProps) {
  const { indexData } = useContext(LogsViewerStateContext);

  if (!indexData || _.isEmpty(indexData)) return null;
  return <FieldValueWithFilterContext name={name} value={value} onValueFilter={onValueFilter} rawValue={rawValue} indexData={indexData} />;
}

function FieldValueWithFilterContext({ name, value, onValueFilter, rawValue, indexData }: RenderValueProps & { indexData: Field[] }) {
  const { t } = useTranslation('explorer');
  const { fieldConfig, range, getAddToQueryInfo } = useContext(LogsViewerStateContext);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const relatedLinks = fieldConfig?.linkArr?.filter((item) => item.field === name);
  const parsedRange = range ? parseRange(range) : null;
  let start = parsedRange ? moment(parsedRange.start).unix() : 0;
  let end = parsedRange ? moment(parsedRange.end).unix() : 0;

  const indexInfo = getAddToQueryInfo
    ? useMemo(() => {
        return getAddToQueryInfo(name, rawValue || {}, indexData);
      }, [name, JSON.stringify(rawValue?.___raw___), JSON.stringify(indexData)])
    : {
        isIndex: true,
        indexName: name,
      };

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
              copy2ClipBoard(value, true);
            }}
          >
            <Space>
              <CopyOutlined />
              {t('common:btn.copy')}
            </Space>
          </li>
          {indexInfo.isIndex && (
            <>
              <li
                className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                onClick={() => {
                  setPopoverVisible(false);
                  onValueFilter?.({
                    key: name,
                    value,
                    operator: 'AND',
                    indexName: indexInfo.indexName,
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
                    indexName: indexInfo.indexName,
                  });
                }}
              >
                <Space>
                  <MinusCircleOutlined />
                  {t('logs.filterNot')}
                </Space>
              </li>
            </>
          )}

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
