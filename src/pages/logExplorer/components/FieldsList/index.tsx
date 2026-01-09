import React, { useState } from 'react';
import { Input, Space, Spin } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NAME_SPACE } from '../../constants';
import FieldsItem from './FieldsItem';
import { TYPE_MAP } from './constants';
import { Field, StatsResult } from './types';

import './style.less';

export type { Field } from './types';

interface Props {
  typeMap?: Record<string, string>;
  organizeFieldNames?: string[];
  onOperClick: (field: string, type: 'show' | 'available') => void;
  fields: Field[];
  enableStats?: boolean;
  onValueFilter?: (parmas: { key: string; value: any; operator: string }) => void;
  fetchStats?: (field: Field) => Promise<StatsResult>;
  loading?: boolean;
  renderStatsPopoverTitleExtra?: (options: {
    index: Field;
    stats?: {
      [index: string]: number;
    };
    setTopNVisible: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
  renderFieldNameExtra?: (field: Field) => React.ReactNode;
  onStatisticClick?: (type: string, statName: string, field: Field) => void;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const {
    typeMap = TYPE_MAP,
    organizeFieldNames,
    onOperClick,
    fields,
    enableStats = true,
    onValueFilter,
    fetchStats,
    loading,
    renderStatsPopoverTitleExtra,
    renderFieldNameExtra,
    onStatisticClick,
  } = props;
  const [fieldsSearch, setFieldsSearch] = useState('');
  const [showFieldsCollapsed, setShowFieldsCollapsed] = useState(false);
  const [availableFieldsCollapsed, setAvailableFieldsCollapsed] = useState(false);

  return (
    <div className='h-full min-h-0'>
      <Input
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
        className='overflow-y-auto mt-[-1px] border border-antd border-t-0 rounded-bl-sm rounded-br-sm py-2'
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
                        onValueFilter={onValueFilter}
                        typeMap={typeMap}
                        fetchStats={fetchStats}
                        enableStats={enableStats}
                        renderStatsPopoverTitleExtra={renderStatsPopoverTitleExtra}
                        renderFieldNameExtra={renderFieldNameExtra}
                      />
                    );
                  },
                )}
              </div>
            </div>
          )}
          <div>
            <div className='font-bold ml-2 mb-2'>
              <Space className='cursor-pointer' onClick={() => setAvailableFieldsCollapsed(!availableFieldsCollapsed)}>
                {availableFieldsCollapsed ? <RightOutlined /> : <DownOutlined />}
                {t('field_list.available_fields')}
              </Space>
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
                      onValueFilter={onValueFilter}
                      typeMap={typeMap}
                      fetchStats={fetchStats}
                      enableStats={enableStats}
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
