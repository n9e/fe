import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import LabelField from "@/pages/traceCpt/components/LabelField";
import { Select } from "antd";
import { LogSortItem } from "../../util";

export function SelectSort(props: { onChange: (v: keyof typeof LogSortItem) => void }) {
  const { t } = useTranslation('explorer');
  const [value, setValue] = useState('NEWEST_FIRST');

  const handleChange = (v) => {
    setValue(v);
    props.onChange(v);
  };

  return (
    <LabelField label='Sort'>
      <Select style={{ width: 130 }} value={value} onChange={handleChange}>
        {(Object.keys(LogSortItem) as Array<keyof typeof LogSortItem>).map((key) => (
          <Select.Option value={key} key={key}>
            {t(`log.sort.${key}`)}
          </Select.Option>
        ))}
      </Select>
    </LabelField>
  );
}