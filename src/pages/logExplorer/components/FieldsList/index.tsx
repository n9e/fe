import React, { useState } from 'react';
import { Input, Space, Spin } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NAME_SPACE } from '../../constants';
import FieldsItem from './FieldsItem';
import { FieldsHelp } from '../Guidance';
import { TYPE_MAP } from './constants';
import { Field, StatsResult, FieldActionOptions } from './types';

import useFieldStatsCache from './useFieldStatsCache';

import './style.less';

export type { Field } from './types';

interface Props {
  typeMap?: Record<string, string>;
  helpCapabilities?: { defaultSearch?: boolean; stack?: boolean };
  organizeFieldNames?: string[];
  onOperClick: (field: string, type: 'show' | 'available') => void;
  fields: Field[];
  enableStats?: boolean;
  disableEmptyValueClick?: boolean;
  onValueFilter?: (parmas: { key: string; value: any; operator: string }) => void;
  fetchStats?: (field: Field) => Promise<StatsResult>;
  fetchUniqueCount?: (field: Field) => Promise<number>;
  statsCacheKey?: string;
  loading?: boolean;
  renderStatsPopoverTitleExtra?: (options: FieldActionOptions) => React.ReactNode;
  renderFieldNameExtra?: (field: Field) => React.ReactNode;
  onStatisticClick?: (
    type: string,
    options: {
      func: string;
      field?: string;
      ref?: string;
      group_by?: string;
      field_filter?: string;
    },
  ) => void;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const {
    typeMap = TYPE_MAP,
    organizeFieldNames,
    onOperClick,
    fields,
    enableStats = true,
    disableEmptyValueClick = true,
    onValueFilter,
    fetchStats,
    loading,
    renderStatsPopoverTitleExtra,
    renderFieldNameExtra,
    onStatisticClick,
  } = props;
  const statsCache = useFieldStatsCache(props.statsCacheKey, fetchStats, props.fetchUniqueCount);
  const [fieldsSearch, setFieldsSearch] = useState('');
  const [showFieldsCollapsed, setShowFieldsCollapsed] = useState(false);
  const [availableFieldsCollapsed, setAvailableFieldsCollapsed] = useState(false);

  return (
    <div className='h-full min-h-0'>
      <Input
        style={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
        placeholder={t('field_search_placeholder')}
        value={fieldsSearch}
        onChange={(e) => {
          setFieldsSearch(e.target.value);
        }}
        allowClear
      />
      <div
        style={{
          height: 'calc(100% - 31px)',
        }}
        className='best-looking-scroll overflow-y-auto mt-[-1px] border border-antd border-t-0 rounded-bl-sm rounded-br-sm py-2'
      >
        <Spin spinning={loading}>
          {organizeFieldNames && organizeFieldNames.length > 0 && (
            <div className='mb-2'>
              <div className='font-bold ml-2 mb-2'>
                <Space className='cursor-pointer' onClick={() => setShowFieldsCollapsed(!showFieldsCollapsed)}>
                  {showFieldsCollapsed ? <RightOutlined /> : <DownOutlined />}
                  {t('field_list.show_fields')}
                </Space>
              </div>
              <div style={{ display: showFieldsCollapsed ? 'none' : 'block' }}>
                {_.map(
                  _.filter(fields, (item) => {
                    if (organizeFieldNames && organizeFieldNames.length > 0 && !_.includes(organizeFieldNames, item.field)) {
                      return false;
                    }
                    if (!fieldsSearch) return true;
                    return _.includes(_.lowerCase(item.field), _.lowerCase(fieldsSearch));
                  }),
                  (item) => {
                    return (
                      <FieldsItem
                        key={item.field}
                        operType='show'
                        onOperClick={() => {
                          onOperClick(item.field, 'show');
                        }}
                        field={item}
                        disableEmptyValueClick={disableEmptyValueClick}
                        onValueFilter={onValueFilter}
                        typeMap={typeMap}
                        fetchStats={statsCache.fetchStats}
                        enableStats={enableStats}
                        getUniqueCount={statsCache.getUniqueCount}
                        statsScope={statsCache}
                        renderStatsPopoverTitleExtra={renderStatsPopoverTitleExtra}
                        renderFieldNameExtra={renderFieldNameExtra}
                        onStatisticClick={onStatisticClick}
                      />
                    );
                  },
                )}
              </div>
            </div>
          )}
          <div>
            <div className='n9e-log-help-label font-bold ml-2 mb-2'>
              <Space className='cursor-pointer' onClick={() => setAvailableFieldsCollapsed(!availableFieldsCollapsed)}>
                {availableFieldsCollapsed ? <RightOutlined /> : <DownOutlined />}
                {t('field_list.available_fields')}
              </Space>
              <FieldsHelp {...props.helpCapabilities} />
            </div>
            <div style={{ display: availableFieldsCollapsed ? 'none' : 'block' }}>
              {_.map(
                _.filter(fields, (item) => {
                  if (organizeFieldNames && organizeFieldNames.length > 0 && _.includes(organizeFieldNames, item.field)) {
                    return false;
                  }
                  if (!fieldsSearch) return true;
                  return _.includes(_.lowerCase(item.field), _.lowerCase(fieldsSearch));
                }),
                (item) => {
                  return (
                    <FieldsItem
                      key={item.field}
                      onOperClick={() => {
                        onOperClick(item.field, 'available');
                      }}
                      operType='available'
                      field={item}
                      disableEmptyValueClick={disableEmptyValueClick}
                      onValueFilter={onValueFilter}
                      typeMap={typeMap}
                      fetchStats={statsCache.fetchStats}
                      enableStats={enableStats}
                      getUniqueCount={statsCache.getUniqueCount}
                      statsScope={statsCache}
                      renderStatsPopoverTitleExtra={renderStatsPopoverTitleExtra}
                      renderFieldNameExtra={renderFieldNameExtra}
                      onStatisticClick={onStatisticClick}
                    />
                  );
                },
              )}
            </div>
          </div>
        </Spin>
      </div>
    </div>
  );
}
