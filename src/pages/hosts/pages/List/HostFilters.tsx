import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import HostsSelect from '@/pages/targets/components/HostsSelect';
// @ts-ignore
import VersionSelect from 'plus:/parcels/Targets/VersionSelect';

import { NS } from '../../constants';

const downtimeOptions = [1, 2, 3, 5, 10, 30];

export interface HostFilterValues {
  query?: string;
  hosts?: string;
  downtime?: number;
  agent_versions?: string[];
  /** AI 任务页专用，普通列表不显示这一项 */
  auth_level?: string;
}

interface Props {
  value: HostFilterValues;
  onChange: (next: HostFilterValues) => void;
  /** AI 任务页：隐藏机器标识筛选，改显示授权等级 */
  aiTaskMode?: boolean;
}

/**
 * 机器筛选条。列表视图和拓扑视图共用同一份控件与同一份状态——
 * 两边各写一套的话，同样的条件会因为参数拼法的细微差别选出不同的机器，
 * 而用户只会把这种差异理解成「拓扑画漏了」。
 *
 * 只管筛选，不管刷新/折叠/批量操作那些：那些是表格专属的动作，
 * 拓扑视图下没有对应语义，混进来只会多出几个点了没反应的按钮。
 */
export default function HostFilters({ value, onChange, aiTaskMode }: Props) {
  const { t } = useTranslation(NS);
  // 搜索框是「回车/失焦才提交」的，本地留一份草稿；外部换值（比如切业务组）要同步回来
  const [searchValue, setSearchValue] = useState(value.query ?? '');
  useEffect(() => {
    setSearchValue(value.query ?? '');
  }, [value.query]);

  const patch = (p: Partial<HostFilterValues>) => onChange({ ...value, ...p });

  return (
    <>
      <Input
        // 唯一可伸缩的控件：宽屏顶到 300px，窄屏最多收到 140px，把余量让给筛选控件和右侧动作区
        className='min-w-[140px] max-w-[300px] flex-1'
        prefix={<SearchOutlined />}
        placeholder={t('search_placeholder')}
        allowClear
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onPressEnter={() => patch({ query: searchValue })}
        onBlur={() => patch({ query: searchValue })}
      />
      {!aiTaskMode && <HostsSelect value={value.hosts} onChange={(newHosts) => patch({ hosts: newHosts })} />}
      <Select
        allowClear
        placeholder={t('filterDowntime')}
        style={{ minWidth: 120 }}
        dropdownMatchSelectWidth={false}
        options={[
          {
            label: t('filterDowntimeNegative'),
            options: _.map(downtimeOptions, (item) => ({ label: t('filterDowntimeNegativeMin', { count: item }), value: -(item * 60) })),
          },
          {
            label: t('filterDowntimePositive'),
            options: _.map(downtimeOptions, (item) => ({ label: t('filterDowntimePositiveMin', { count: item }), value: item * 60 })),
          },
        ]}
        value={value.downtime}
        onChange={(val) => patch({ downtime: val })}
      />
      <VersionSelect value={value.agent_versions} onChange={(val) => patch({ agent_versions: val })} />
      {aiTaskMode && (
        <Select
          style={{ minWidth: 120 }}
          allowClear
          showArrow
          mode='multiple'
          placeholder={t('auth_level')}
          dropdownMatchSelectWidth={false}
          options={[
            { label: t('auth_level_1'), value: 1 },
            { label: t('auth_level_2'), value: 2 },
            { label: t('auth_level_3'), value: 3 },
          ]}
          value={value.auth_level ? value.auth_level.split(',').map(Number) : undefined}
          onChange={(val: number[]) => patch({ auth_level: val.length > 0 ? val.join(',') : undefined })}
        />
      )}
    </>
  );
}
