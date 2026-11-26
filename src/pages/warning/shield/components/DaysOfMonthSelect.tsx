import React from 'react';
import { Select, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { LAST_DAY_OF_MONTH, sortDaysOfMonth } from './periodic';

interface Props {
  value?: number[];
  onChange?: (value: number[]) => void;
  disabled?: boolean;
}

const DAYS = _.range(1, 32);

/**
 * 周期屏蔽的每月日期选择，下拉是 1~31 的日历网格，底部单独放「最后一天」
 */
export default function DaysOfMonthSelect(props: Props) {
  const { t } = useTranslation('alertMutes');
  const { value, onChange, disabled } = props;

  const toggle = (day: number) => {
    onChange?.(sortDaysOfMonth(_.includes(value, day) ? _.without(value, day) : [...(value || []), day]));
  };

  const renderDay = (day: number, label: React.ReactNode, block?: boolean) => (
    <Button
      key={day}
      size='small'
      block={block}
      type={_.includes(value, day) ? 'primary' : 'default'}
      onMouseDown={(e) => {
        // 阻止下拉收起，保证连续选择
        e.preventDefault();
      }}
      onClick={() => toggle(day)}
    >
      {label}
    </Button>
  );

  return (
    <Select
      mode='multiple'
      value={value}
      onChange={(val) => onChange?.(sortDaysOfMonth(val))}
      disabled={disabled}
      showSearch={false}
      options={[..._.map(DAYS, (day) => ({ label: t('mute_type.day_of_month', { day }), value: day })), { label: t('mute_type.last_day'), value: LAST_DAY_OF_MONTH }]}
      dropdownRender={() => (
        <div className='p-2'>
          <div className='grid grid-cols-7 gap-1'>{_.map(DAYS, (day) => renderDay(day, day))}</div>
          <div className='mt-1'>{renderDay(LAST_DAY_OF_MONTH, t('mute_type.last_day'), true)}</div>
        </div>
      )}
    />
  );
}
