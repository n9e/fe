import React from 'react';
import { Space } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { copy2ClipBoard } from '@/utils';
import IconFont from '@/components/IconFont';
import { handleNav } from '@/pages/explorer/components/Links';
import type { ILogExtract, ILogMappingParams } from '@/pages/log/IndexPatterns/types';
import ExistsIcon from '@/pages/explorer/components/RenderValue/ExistsIcon';

import { normalizeRawValueForNav } from './tokenActionMenu.utils';
import { toString } from './util';
import { NAME_SPACE } from '../../../../constants';
import { OnValueFilterParams } from '../../types';

/** handleNav / 外链菜单用到的 fieldConfig 子集 */
export interface TokenMenuFieldConfig {
  regExtractArr?: ILogExtract[];
  mappingParamsArr?: ILogMappingParams[];
}

interface TokenActionMenuContentProps {
  close: () => void;
  name: string;
  fieldValue: string;
  fragmentValue: string;
  showFragmentFilters: boolean;
  onTokenClick?: (parmas: OnValueFilterParams) => void;
  indexInfo: { isIndex: boolean; indexName: string };
  showExistsAction?: boolean;
  relatedLinks?: { name: string; urlTemplate: string; field?: string }[];
  start: number;
  end: number;
  rawValue?: Record<string, unknown>;
  fieldConfig?: TokenMenuFieldConfig;
}

export function TokenActionMenuContent(props: TokenActionMenuContentProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { close, name, fieldValue, fragmentValue, showFragmentFilters, onTokenClick, indexInfo, showExistsAction, relatedLinks, start, end, rawValue, fieldConfig } = props;

  return (
    <ul className='ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light'>
      <li
        className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
        onClick={() => {
          close();
          copy2ClipBoard(`${name}:${fieldValue}`);
        }}
      >
        <Space>
          <CopyOutlined />
          {t('common:btn.copy')}
        </Space>
      </li>
      <li
        className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
        onClick={() => {
          close();
          copy2ClipBoard(fieldValue);
        }}
      >
        <Space>
          <CopyOutlined />
          {t('logs.copy_field_value')}
        </Space>
      </li>
      {onTokenClick && (
        <>
          {indexInfo.isIndex && (
            <>
              {showFragmentFilters && (
                <>
                  <li
                    className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                    onClick={() => {
                      close();
                      onTokenClick?.({
                        key: name,
                        value: fragmentValue,
                        assignmentOperator: ':',
                        operator: 'AND',
                        indexName: indexInfo.indexName,
                      });
                    }}
                  >
                    <Space>
                      <PlusCircleOutlined />
                      {t('logs.filterAnd', {
                        token: toString(fragmentValue),
                      })}
                    </Space>
                  </li>
                  <li
                    className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                    onClick={() => {
                      close();
                      onTokenClick?.({
                        key: name,
                        value: fragmentValue,
                        assignmentOperator: ':',
                        operator: 'NOT',
                        indexName: indexInfo.indexName,
                      });
                    }}
                  >
                    <Space>
                      <MinusCircleOutlined />
                      {t('logs.filterNot', {
                        token: toString(fragmentValue),
                      })}
                    </Space>
                  </li>
                </>
              )}
              <li
                className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                onClick={() => {
                  close();
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
                  close();
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
                    close();
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
          {relatedLinks?.map((i, idx) => {
            return (
              <li
                key={`${i.name}-${idx}`}
                className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                style={{ textDecoration: 'underline' }}
                onClick={() => {
                  handleNav(i.urlTemplate, normalizeRawValueForNav(rawValue), { start, end }, fieldConfig?.regExtractArr, fieldConfig?.mappingParamsArr);
                }}
              >
                {i.name}
                <span style={{ background: 'var(--fc-fill-4)', marginLeft: 6, display: 'inline-flex', padding: 3, borderRadius: 2 }}>
                  <IconFont type='icon-ic_arrow_right' style={{ color: 'var(--fc-fill-primary)', height: 12 }} />
                </span>
              </li>
            );
          })}
        </>
      )}
    </ul>
  );
}
