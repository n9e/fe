import React from 'react';
import { Select, Divider, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { daysOfWeek } from '@/pages/alertRules/constants';

interface Props {
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
}

const PRESETS: { key: 'everyday' | 'workday' | 'weekend'; days: string[] }[] = [
  { key: 'everyday', days: ['1', '2', '3', '4', '5', '6', '0'] },
  { key: 'workday', days: ['1', '2', '3', '4', '5'] },
  { key: 'weekend', days: ['6', '0'] },
];

/**
 * 周期屏蔽的星期选择，下拉底部提供「每天 / 工作日 / 周末」快捷选项
 */
export default function DaysOfWeekSelect(props: Props) {
  const { t } = useTranslation('alertMutes');
  const { value, onChange, disabled } = props;

  return (
    <Select
      mode='multiple'
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={_.map(daysOfWeek, (item) => {
        return {
          label: t(`common:time.weekdays.${item}`),
          value: String(item),
        };
      })}
      dropdownRender={(menu) => (
        <>
          {menu}
          <Divider className='my-1' />
          <Space className='px-2 pb-1'>
            {_.map(PRESETS, (preset) => (
              <a
                key={preset.key}
                onMouseDown={(e) => {
                  // 阻止下拉收起，保证连续选择
                  e.preventDefault();
                }}
                onClick={() => {
                  onChange?.(preset.days);
                }}
              >
                {t(`mute_type.days_preset.${preset.key}`)}
              </a>
            ))}
          </Space>
        </>
      )}
    />
  );
}
